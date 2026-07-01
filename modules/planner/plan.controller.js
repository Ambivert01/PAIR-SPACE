import Plan from "./plan.model.js";
import { verifyRelationshipMember } from "../../shared/utils/relationshipValidator.js";
import Relationship from "../relationship/relationship.model.js";
import Message from "../chat/message.model.js";
import { createNotification } from "../notification/notification.service.js";


const systemMsg = async (relationshipId, senderId, content) => {
  await Message.create({ relationshipId, senderId, type: "system", content, status: "sent" }).catch(() => {});
};

// ── create ─────────────────────────────────────────────────────────────────
export const createPlan = async (req, res) => {
  const userId = req.user.userId;
  const { relationshipId, type, title, description, startDate, endDate, dueDate,
          recurrence, priority, tags, checklist, reminderSettings, visibility } = req.body;

  if (!title?.trim()) return res.status(422).json({ error: true, message: "Title required" });

  try {
    const rel = await verifyRelationshipMember(relationshipId, userId);
    if (!rel) return res.status(403).json({ error: true, message: "Access denied" });

    const plan = await Plan.create({
      relationshipId, createdBy: userId, type,
      title: title.trim(), description: description?.trim() || "",
      startDate, endDate, dueDate, recurrence: recurrence || "none",
      priority: priority || "medium",
      tags: tags || [],
      checklist: checklist || [],
      reminderSettings: reminderSettings || { enabled: false },
      visibility: visibility || "shared",
      participants: [rel.user1Id, rel.user2Id],
      status: "pending",
    });

    const LABELS = {
      event: "📅 New event added", goal: "🎯 New goal created",
      habit: "🔥 New habit started", trip_plan: "✈️ Trip planned",
      reminder: "⏰ Reminder set", task: "✅ Task added",
    };
    await systemMsg(relationshipId, userId, LABELS[type] || `📋 ${title} added`);

    // schedule reminder notifications if dueDate + reminder enabled
    if (plan.reminderSettings?.enabled && plan.dueDate) {
      const OFFSETS = { "10_minutes_before": 10, "1_hour_before": 60, "1_day_before": 1440 };
      for (const rt of (plan.reminderSettings.reminderTimes || [])) {
        const offsetMins = OFFSETS[rt] || 10;
        const scheduledFor = new Date(plan.dueDate.getTime() - offsetMins * 60 * 1000);
        if (scheduledFor > new Date()) {
          // notify both partners
          for (const pid of [rel.user1Id.toString(), rel.user2Id.toString()]) {
            createNotification({
              userId: pid, relationshipId,
              type: "planner_reminder",
              title: `⏰ Reminder: ${plan.title}`,
              message: `Due ${new Date(plan.dueDate).toLocaleString()}`,
              entityType: "plan", entityId: plan._id,
              priority: "high", scheduledFor,
            });
          }
        }
      }
    }

    res.status(201).json(plan);
  } catch (err) {
    res.status(500).json({ error: true, message: "Failed to create plan" });
  }
};

// ── list ───────────────────────────────────────────────────────────────────
export const listPlans = async (req, res) => {
  const userId = req.user.userId;
  const { relationshipId, type, status, from, to, limit = 30, cursor } = req.query;

  try {
    const rel = await verifyRelationshipMember(relationshipId, userId);
    if (!rel) return res.status(403).json({ error: true, message: "Access denied" });

    const query = { relationshipId, deleted: false };
    if (type)   query.type   = type;
    if (status) query.status = status;
    if (from || to) {
      query.startDate = {};
      if (from) query.startDate.$gte = new Date(from);
      if (to)   query.startDate.$lte = new Date(to);
    }
    if (cursor) query.createdAt = { $lt: new Date(cursor) };

    const plans = await Plan.find(query)
      .sort({ dueDate: 1, startDate: 1, createdAt: -1 })
      .limit(Number(limit));

    const nextCursor = plans.length === Number(limit)
      ? plans[plans.length - 1].createdAt.toISOString()
      : null;

    res.json({ plans, nextCursor });
  } catch {
    res.status(500).json({ error: true, message: "Failed to fetch plans" });
  }
};

// ── update ─────────────────────────────────────────────────────────────────
export const updatePlan = async (req, res) => {
  const userId = req.user.userId;
  const allowed = ["title","description","startDate","endDate","dueDate","recurrence",
                   "priority","status","progress","tags","checklist","reminderSettings","visibility"];
  const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));

  try {
    const plan = await Plan.findById(req.params.planId);
    if (!plan || plan.deleted) return res.status(404).json({ error: true, message: "Not found" });

    const rel = await verifyRelationshipMember(plan.relationshipId, userId);
    if (!rel) return res.status(403).json({ error: true, message: "Access denied" });

    Object.assign(plan, updates);

    // auto-complete progress
    if (updates.status === "completed" && plan.progress < 100) plan.progress = 100;

    await plan.save();

    if (updates.status === "completed") {
      await systemMsg(plan.relationshipId, userId, `✅ "${plan.title}" completed!`);
    }

    res.json(plan);
  } catch {
    res.status(500).json({ error: true, message: "Failed to update plan" });
  }
};

// ── delete (soft) ──────────────────────────────────────────────────────────
export const deletePlan = async (req, res) => {
  const userId = req.user.userId;
  try {
    const plan = await Plan.findById(req.params.planId);
    if (!plan) return res.status(404).json({ error: true, message: "Not found" });

    const rel = await verifyRelationshipMember(plan.relationshipId, userId);
    if (!rel) return res.status(403).json({ error: true, message: "Access denied" });

    plan.deleted = true;
    await plan.save();
    res.json({ message: "Deleted" });
  } catch {
    res.status(500).json({ error: true, message: "Failed to delete" });
  }
};

// ── complete habit (streak logic) ──────────────────────────────────────────
export const completeHabit = async (req, res) => {
  const userId = req.user.userId;
  try {
    const plan = await Plan.findById(req.params.planId);
    if (!plan || plan.type !== "habit") return res.status(404).json({ error: true, message: "Habit not found" });

    const rel = await verifyRelationshipMember(plan.relationshipId, userId);
    if (!rel) return res.status(403).json({ error: true, message: "Access denied" });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // check already logged today
    const alreadyDone = plan.habitLogs.some((l) => {
      const d = new Date(l.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime() && l.completed;
    });

    if (alreadyDone) return res.status(409).json({ error: true, message: "Already completed today" });

    plan.habitLogs.push({ date: today, completed: true });

    // streak calculation
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const hadYesterday = plan.habitLogs.some((l) => {
      const d = new Date(l.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === yesterday.getTime() && l.completed;
    });

    plan.streakCount = hadYesterday ? plan.streakCount + 1 : 1;
    if (plan.streakCount > plan.longestStreak) plan.longestStreak = plan.streakCount;

    await plan.save();

    await systemMsg(plan.relationshipId, userId,
      `🔥 "${plan.title}" — ${plan.streakCount} day streak!`
    );

    res.json({ streakCount: plan.streakCount, longestStreak: plan.longestStreak });
  } catch {
    res.status(500).json({ error: true, message: "Failed to log habit" });
  }
};

// ── toggle checklist item ──────────────────────────────────────────────────
export const toggleChecklistItem = async (req, res) => {
  const userId = req.user.userId;
  const { itemIndex } = req.body;
  try {
    const plan = await Plan.findById(req.params.planId);
    if (!plan) return res.status(404).json({ error: true, message: "Not found" });

    const rel = await verifyRelationshipMember(plan.relationshipId, userId);
    if (!rel) return res.status(403).json({ error: true, message: "Access denied" });

    if (plan.checklist[itemIndex] === undefined)
      return res.status(422).json({ error: true, message: "Invalid item index" });

    plan.checklist[itemIndex].completed = !plan.checklist[itemIndex].completed;

    // auto-update progress from checklist
    const done = plan.checklist.filter((i) => i.completed).length;
    plan.progress = Math.round((done / plan.checklist.length) * 100);

    await plan.save();
    res.json({ checklist: plan.checklist, progress: plan.progress });
  } catch {
    res.status(500).json({ error: true, message: "Failed to update checklist" });
  }
};
