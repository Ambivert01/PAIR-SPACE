import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Load environment variables from services/api/.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../services/api/.env") });

// models
import User from "../modules/auth/user.model.js";
import Relationship from "../modules/relationship/relationship.model.js";
import Message from "../modules/chat/message.model.js";
import Memory from "../modules/memory/memory.model.js";
import Plan from "../modules/planner/plan.model.js";
import Activity from "../modules/sync/activity.model.js";
import JournalEntry from "../modules/journal/journal.model.js";
import Gift from "../modules/gifts/gift.model.js";
import TimeCapsule from "../modules/time-capsule/capsule.model.js";
import Call from "../modules/call/call.model.js";
import { Notification } from "../modules/notification/notification.model.js";
import {
  UserSettings,
  RelationshipSettings,
} from "../modules/settings/settings.model.js";
import Personalization from "../modules/personalization/personalization.model.js";
import RelationshipInsight from "../modules/insights/insight.model.js";
import AIInsight from "../modules/ai/ai.insight.model.js";

// Mood model (inline schema for seed since we don't export it separately)
const moodSchema = new mongoose.Schema({
  relationshipId: { type: mongoose.Schema.Types.ObjectId, ref: "Relationship" },
  userId:         { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  emoji:          String,
  note:           String,
  checkedInAt:    { type: Date, default: Date.now },
}, { timestamps: true });
const MoodEntry = mongoose.models.MoodEntry || mongoose.model("MoodEntry", moodSchema);

const DEMO_EMAILS = ["parth.demo@example.com", "alex.demo@example.com"];

const daysAgo = (n) => new Date(Date.now() - n * 86400000);
const hoursAgo = (n) => new Date(Date.now() - n * 3600000);

async function seed() {
  if (process.env.NODE_ENV === "production") {
    console.error("❌  Seed blocked in production.");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅  DB connected");

  // Start transaction for atomic seed
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // ── clear existing demo data ──────────────────────────────────────────────
    const existingUsers = await User.find({
      email: { $in: DEMO_EMAILS },
    }).session(session);
    const existingIds = existingUsers.map((u) => u._id);

    if (existingIds.length) {
      const rels = await Relationship.find({
        $or: [
          { user1Id: { $in: existingIds } },
          { user2Id: { $in: existingIds } },
        ],
      }).session(session);
      const relIds = rels.map((r) => r._id);

      await Promise.all([
        Message.deleteMany({ relationshipId: { $in: relIds } }).session(
          session,
        ),
        Memory.deleteMany({ relationshipId: { $in: relIds } }).session(session),
        Plan.deleteMany({ relationshipId: { $in: relIds } }).session(session),
        Activity.deleteMany({ relationshipId: { $in: relIds } }).session(
          session,
        ),
        JournalEntry.deleteMany({ relationshipId: { $in: relIds } }).session(
          session,
        ),
        Gift.deleteMany({ relationshipId: { $in: relIds } }).session(session),
        TimeCapsule.deleteMany({ relationshipId: { $in: relIds } }).session(
          session,
        ),
        Call.deleteMany({ relationshipId: { $in: relIds } }).session(session),
        Notification.deleteMany({ relationshipId: { $in: relIds } }).session(
          session,
        ),
        RelationshipSettings.deleteMany({
          relationshipId: { $in: relIds },
        }).session(session),
        Personalization.deleteMany({ relationshipId: { $in: relIds } }).session(
          session,
        ),
        RelationshipInsight.deleteMany({
          relationshipId: { $in: relIds },
        }).session(session),
        AIInsight.deleteMany({ relationshipId: { $in: relIds } }).session(
          session,
        ),
        UserSettings.deleteMany({ userId: { $in: existingIds } }).session(
          session,
        ),
        Relationship.deleteMany({ _id: { $in: relIds } }).session(session),
        User.deleteMany({ _id: { $in: existingIds } }).session(session),
      ]);
      console.log("🧹  Cleared existing demo data");
    }

    // ── users ─────────────────────────────────────────────────────────────────
    const hash = await bcrypt.hash("Demo@123", 10);
    const [parth, alex] = await User.insertMany(
      [
        {
          email: "parth.demo@example.com",
          passwordHash: hash,
          displayName: "Parth",
          timezone: "Asia/Kolkata",
          language: "en",
          onboarding: {
            completed: true,
            currentStep: "completed",
            completedAt: daysAgo(30),
          },
        },
        {
          email: "alex.demo@example.com",
          passwordHash: hash,
          displayName: "Alex",
          timezone: "Asia/Kolkata",
          language: "en",
          onboarding: {
            completed: true,
            currentStep: "completed",
            completedAt: daysAgo(30),
          },
        },
      ],
      { session },
    );

    // Critical entity check
    if (!parth || !alex) {
      throw new Error("Critical seed failure: missing core user entities");
    }
    console.log("👤  Users created");

    // ── relationships ─────────────────────────────────────────────────────────
    const rel1 = await Relationship.create(
      [
        {
          user1Id: parth._id,
          user2Id: alex._id,
          status: "active",
          relationshipType: "romantic",
          nickname: "Our Space ❤️",
          anniversaryDate: daysAgo(30),
        },
      ],
      { session },
    );

    // second relationship (best friend — different pair using same users for demo)
    const rel2 = await Relationship.create(
      [
        {
          user1Id: alex._id,
          user2Id: parth._id,
          status: "active",
          relationshipType: "best_friend",
          nickname: "Bestie Zone 🌟",
        },
      ],
      { session },
    );

    // Critical entity check
    if (!rel1 || !rel1[0] || !rel2 || !rel2[0]) {
      throw new Error(
        "Critical seed failure: missing core relationship entities",
      );
    }
    console.log("💑  Relationships created");

    // ── settings ──────────────────────────────────────────────────────────────
    await UserSettings.insertMany(
      [{ userId: parth._id }, { userId: alex._id }],
      { session },
    );
    await RelationshipSettings.insertMany(
      [
        {
          relationshipId: rel1[0]._id,
          customRelationshipName: "Our Space ❤️",
          allowAIInsights: true,
        },
        {
          relationshipId: rel2[0]._id,
          customRelationshipName: "Bestie Zone 🌟",
        },
      ],
      { session },
    );
    await Personalization.insertMany(
      [
        {
          relationshipId: rel1[0]._id,
          relationshipName: "Our Space ❤️",
          theme: "soft_romantic",
          accentColor: "#f43f5e",
          chatBubbleStyle: "rounded",
          visualMood: "warm",
        },
        {
          relationshipId: rel2[0]._id,
          relationshipName: "Bestie Zone 🌟",
          theme: "pastel_light",
          accentColor: "#8b5cf6",
        },
      ],
      { session },
    );
    console.log("⚙️   Settings & personalization created");

    // ── messages (50+) ────────────────────────────────────────────────────────
    const msgTexts = [
      ["Good morning ❤️", parth._id],
      ["Morning! Did you sleep well? 😊", alex._id],
      ["Yeah! Had a great dream about us 🌙", parth._id],
      ["Aww that's so sweet 🥺", alex._id],
      ["Did you eat breakfast?", parth._id],
      ["Not yet, making coffee ☕", alex._id],
      ["Don't skip meals please 🙏", parth._id],
      ["Okay okay I'll eat 😄", alex._id],
      ["How was your day?", parth._id],
      ["Exhausting but good. Had a big presentation", alex._id],
      ["I'm so proud of you! 🎉", parth._id],
      ["Couldn't have done it without your support ❤️", alex._id],
      ["Miss you so much today", parth._id],
      ["Miss you too 💕", alex._id],
      ["Call tonight?", parth._id],
      ["Yes! 10pm?", alex._id],
      ["Perfect 🌟", parth._id],
      ["I am feeling stressed today", alex._id],
      ["Hey, breathe. You've got this 💪", parth._id],
      ["Thank you for always being there", alex._id],
      ["Always ❤️", parth._id],
      ["Look at this sunset photo!", alex._id],
      ["Wow that's beautiful 😍", parth._id],
      ["Reminds me of our trip plan", alex._id],
      ["We should go soon!", parth._id],
      ["Yes! Let's plan for next month 🗺️", alex._id],
      ["I'll book the tickets", parth._id],
      ["Yay! So excited 🎊", alex._id],
      ["Good night 🌙", parth._id],
      ["Sweet dreams ✨", alex._id],
      ["Good morning again ☀️", parth._id],
      ["Haha good morning 😂", alex._id],
      ["How's the study going?", parth._id],
      ["Slow but steady 📚", alex._id],
      ["You'll ace it!", parth._id],
      ["From your mouth to God's ears 🙏", alex._id],
      ["Watched that movie you recommended", parth._id],
      ["And?? Did you like it?", alex._id],
      ["Loved it! Let's watch together next time", parth._id],
      ["Movie night this weekend! 🎬", alex._id],
      ["Can't wait!", parth._id],
      ["Me neither 🥰", alex._id],
      ["Happy one month! 🎉", parth._id],
      ["One month already?! Time flies ❤️", alex._id],
      ["Best month of my life", parth._id],
      ["Mine too 💕", alex._id],
      ["I got you something special", parth._id],
      ["What?! Tell me tell me!", alex._id],
      ["You'll see 😏", parth._id],
      ["You're the best ❤️", alex._id],
      // Edge cases
      [
        "This is a very long message that tests how the UI handles extended text content. Sometimes people write paragraphs in chat messages and we need to ensure the layout doesn't break. This message is intentionally verbose to simulate real-world usage where users might share detailed stories, important information, or just ramble on about their day. The UI should gracefully handle this without breaking the design or making it hard to read.",
        parth._id,
      ],
      ["😍🥰❤️💕✨🌟💫🎉", alex._id], // emoji-only
      ["", parth._id], // will be marked as deleted
      ["Hey", alex._id], // rapid consecutive
      ["Hey", alex._id],
      ["Are you there?", alex._id],
    ];

    const messages = [];
    for (let i = 0; i < msgTexts.length; i++) {
      const [content, senderId] = msgTexts[i];
      messages.push({
        relationshipId: rel1[0]._id,
        senderId,
        type:
          content.startsWith("http") || content.includes("/demo/")
            ? "image"
            : "text",
        content,
        mediaUrl: content.includes("/demo/") ? content : undefined,
        status: i < 45 ? "read" : i < 50 ? "delivered" : "sent",
        createdAt: new Date(Date.now() - (msgTexts.length - i) * 60000), // 1-minute realistic intervals
      });
    }

    // Add media messages
    messages.push({
      relationshipId: rel1[0]._id,
      senderId: alex._id,
      type: "image",
      content: "Check out this photo!",
      mediaUrl: "/demo/sample1.jpg",
      status: "read",
      createdAt: new Date(Date.now() - 30 * 60000),
    });
    messages.push({
      relationshipId: rel1[0]._id,
      senderId: parth._id,
      type: "image",
      content: "Beautiful! 📸",
      mediaUrl: "/demo/sample2.jpg",
      status: "read",
      createdAt: new Date(Date.now() - 25 * 60000),
    });

    try {
      const insertedMsgs = await Message.insertMany(messages, { session });
      // add a reaction to message index 3
      await Message.findByIdAndUpdate(
        insertedMsgs[3]._id,
        {
          reactions: [{ userId: parth._id, emoji: "❤️" }],
        },
        { session },
      );
      // mark one as edited
      await Message.findByIdAndUpdate(
        insertedMsgs[10]._id,
        { edited: true },
        { session },
      );
      // mark one as deleted
      await Message.findByIdAndUpdate(
        insertedMsgs[52]._id,
        { deleted: true, content: "" },
        { session },
      );
      console.log("💬  Messages created");
    } catch (err) {
      console.error("❌ Failed at messages:", err.message);
      throw err;
    }

    // Add minimal messages for rel2 (multi-relationship isolation test)
    try {
      await Message.insertMany(
        [
          {
            relationshipId: rel2[0]._id,
            senderId: alex._id,
            type: "text",
            content: "Hey bestie! 🌟",
            status: "read",
            createdAt: daysAgo(5),
          },
          {
            relationshipId: rel2[0]._id,
            senderId: parth._id,
            type: "text",
            content: "Hey! What's up?",
            status: "read",
            createdAt: daysAgo(5),
          },
          {
            relationshipId: rel2[0]._id,
            senderId: alex._id,
            type: "text",
            content: "Just checking in 💙",
            status: "read",
            createdAt: daysAgo(4),
          },
        ],
        { session },
      );
      console.log("💬  Multi-relationship messages created");
    } catch (err) {
      console.error("❌ Failed at multi-rel messages:", err.message);
      throw err;
    }

    // ── memories (12+) ────────────────────────────────────────────────────────
    const memoriesData = [
      {
        type: "milestone",
        title: "Our Space Began ✨",
        description:
          "The day we connected on PairSpace. This is where our journey started.",
        emotionTag: "celebration",
        tags: ["milestone", "first", "important"],
        memoryDate: daysAgo(30),
        pinned: true,
      },
      {
        type: "text_note",
        title: "First Long Call 📞",
        description: "We talked for 3 hours straight. Time flew by.",
        emotionTag: "happy",
        tags: ["call", "first"],
        memoryDate: daysAgo(28),
      },
      {
        type: "photo",
        title: "Movie Night Screenshot 🎬",
        description: "Watching our first movie together remotely.",
        emotionTag: "romantic",
        tags: ["movie", "fun"],
        memoryDate: daysAgo(25),
      },
      {
        type: "achievement",
        title: "Alex's Big Presentation 🎉",
        description: "So proud of you for nailing that presentation!",
        emotionTag: "proud",
        tags: ["achievement", "proud"],
        memoryDate: daysAgo(20),
      },
      {
        type: "gratitude_note",
        title: "Thank You Note 💕",
        description: "For always being there when I needed you.",
        emotionTag: "grateful",
        tags: ["gratitude"],
        memoryDate: daysAgo(18),
      },
      {
        type: "text_note",
        title: "Shared Study Session 📚",
        description: "Studied together for 2 hours on video call.",
        emotionTag: "calm",
        tags: ["study", "focus"],
        memoryDate: daysAgo(15),
      },
      {
        type: "milestone",
        title: "First Month Together 🎊",
        description:
          "One month of building something beautiful. This is an important milestone for us.",
        emotionTag: "celebration",
        tags: ["milestone", "anniversary", "important"],
        memoryDate: daysAgo(0),
        pinned: true,
      },
      {
        type: "custom_event",
        title: "That Hilarious Moment 😂",
        description: "When we both said the same thing at the same time.",
        emotionTag: "funny",
        tags: ["funny", "moment"],
        memoryDate: daysAgo(12),
      },
      {
        type: "promise",
        title: "Our Promise 🤝",
        description:
          "We promised to always communicate openly. This is a secret promise between us.",
        emotionTag: "love",
        tags: ["promise", "secret"],
        memoryDate: daysAgo(22),
      },
      {
        type: "goal_created",
        title: "Trip Planning Started ✈️",
        description:
          "Started planning our first trip together! Birthday surprise in the works.",
        emotionTag: "excited",
        tags: ["trip", "goal", "birthday"],
        memoryDate: daysAgo(10),
      },
      {
        type: "voice_note",
        title: "Good Night Voice Note 🌙",
        description: "Recorded a little voice note before sleeping.",
        emotionTag: "romantic",
        tags: ["night", "voice"],
        memoryDate: daysAgo(5),
      },
      {
        type: "text_note",
        title: "Support Moment 💪",
        description: "You were stressed and I was there. That matters.",
        emotionTag: "supportive",
        tags: ["support", "stress"],
        memoryDate: daysAgo(3),
      },
    ];

    try {
      const memories = await Memory.insertMany(
        memoriesData.map((m) => ({
          ...m,
          relationshipId: rel1[0]._id,
          creatorId: parth._id,
          visibility: "visible",
        })),
        { session },
      );
      // add reaction + comment to first memory
      await Memory.findByIdAndUpdate(
        memories[0]._id,
        {
          reactions: [{ userId: alex._id, emoji: "❤️" }],
          comments: [
            {
              userId: alex._id,
              text: "This is where it all started 🥺",
              createdAt: daysAgo(29),
            },
          ],
          favoritedBy: [parth._id, alex._id],
        },
        { session },
      );
      console.log("🧠  Memories created");
    } catch (err) {
      console.error("❌ Failed at memories:", err.message);
      throw err;
    }

    // Add minimal memory for rel2 (multi-relationship isolation test)
    try {
      await Memory.create(
        [
          {
            relationshipId: rel2[0]._id,
            creatorId: alex._id,
            type: "text_note",
            title: "Bestie Hangout 🌟",
            description: "Had an amazing time catching up!",
            emotionTag: "happy",
            tags: ["hangout", "fun"],
            memoryDate: daysAgo(3),
            visibility: "visible",
          },
        ],
        { session },
      );
      console.log("🧠  Multi-relationship memory created");
    } catch (err) {
      console.error("❌ Failed at multi-rel memory:", err.message);
      throw err;
    }

    // ── calls (6) ─────────────────────────────────────────────────────────────
    try {
      await Call.insertMany(
        [
          {
            relationshipId: rel1[0]._id,
            startedBy: parth._id,
            callType: "voice",
            status: "ended",
            duration: 720,
            startedAt: daysAgo(28),
            endedAt: daysAgo(28),
          },
          {
            relationshipId: rel1[0]._id,
            startedBy: alex._id,
            callType: "video",
            status: "ended",
            duration: 1920,
            startedAt: daysAgo(25),
            endedAt: daysAgo(25),
          },
          {
            relationshipId: rel1[0]._id,
            startedBy: parth._id,
            callType: "voice",
            status: "ended",
            duration: 1500,
            startedAt: daysAgo(20),
            endedAt: daysAgo(20),
          },
          {
            relationshipId: rel1[0]._id,
            startedBy: alex._id,
            callType: "video",
            status: "ended",
            duration: 2820,
            startedAt: daysAgo(15),
            endedAt: daysAgo(15),
          },
          {
            relationshipId: rel1[0]._id,
            startedBy: parth._id,
            callType: "voice",
            status: "missed",
            duration: 0,
            startedAt: daysAgo(8),
          },
          {
            relationshipId: rel1[0]._id,
            startedBy: parth._id,
            callType: "video",
            status: "ended",
            duration: 3600,
            startedAt: daysAgo(2),
            endedAt: daysAgo(2),
          },
        ],
        { session },
      );
      console.log("📞  Calls created");
    } catch (err) {
      console.error("❌ Failed at calls:", err.message);
      throw err;
    }

    // ── activities (4) ────────────────────────────────────────────────────────
    try {
      await Activity.insertMany(
        [
          {
            relationshipId: rel1[0]._id,
            activityType: "watch_together",
            createdBy: parth._id,
            status: "ended",
            startedAt: daysAgo(25),
            endedAt: daysAgo(25),
            state: { currentTime: 5400, duration: 5400, paused: false },
            metadata: {
              title: "Movie Night 🎬",
              externalUrl: "https://youtube.com",
            },
            participants: [parth._id, alex._id],
          },
          {
            relationshipId: rel1[0]._id,
            activityType: "focus_session",
            createdBy: alex._id,
            status: "ended",
            startedAt: daysAgo(15),
            endedAt: daysAgo(15),
            state: { currentTime: 1500, duration: 1500, paused: false },
            metadata: { title: "Study Focus 25min 📚" },
            participants: [parth._id, alex._id],
          },
          {
            relationshipId: rel1[0]._id,
            activityType: "study_session",
            createdBy: parth._id,
            status: "ended",
            startedAt: daysAgo(10),
            endedAt: daysAgo(10),
            state: { currentTime: 3600, duration: 3600, paused: false },
            metadata: { title: "Exam Prep Session" },
            participants: [parth._id, alex._id],
          },
          {
            relationshipId: rel1[0]._id,
            activityType: "watch_together",
            createdBy: alex._id,
            status: "active",
            startedAt: hoursAgo(1),
            state: { currentTime: 1200, duration: 7200, paused: true },
            metadata: { title: "Weekend Movie 🍿" },
            participants: [parth._id, alex._id],
          },
        ],
        { session },
      );
      console.log("🎯  Activities created");
    } catch (err) {
      console.error("❌ Failed at activities:", err.message);
      throw err;
    }

    // ── plans (6) ─────────────────────────────────────────────────────────────
    try {
      await Plan.insertMany(
        [
          {
            relationshipId: rel1[0]._id,
            createdBy: parth._id,
            type: "habit",
            title: "Good Morning Text 🌅",
            description: "Send a good morning message every day.",
            recurrence: "daily",
            priority: "high",
            status: "active",
            streakCount: 7,
            longestStreak: 7,
            participants: [parth._id, alex._id],
          },
          {
            relationshipId: rel1[0]._id,
            createdBy: alex._id,
            type: "event",
            title: "Weekend Movie Night 🎬",
            description: "Watch a movie together this weekend.",
            startDate: daysAgo(-2),
            priority: "medium",
            status: "pending",
            participants: [parth._id, alex._id],
            tags: ["movie", "weekend"],
          },
          {
            relationshipId: rel1[0]._id,
            createdBy: parth._id,
            type: "goal",
            title: "Plan Our First Trip ✈️",
            description: "Research and book our first trip.",
            priority: "important",
            status: "active",
            progress: 40,
            participants: [parth._id, alex._id],
            tags: ["trip", "goal"],
          },
          {
            relationshipId: rel1[0]._id,
            createdBy: alex._id,
            type: "reminder",
            title: "Birthday Reminder 🎂",
            description: "Parth's birthday coming up!",
            dueDate: daysAgo(-15),
            priority: "important",
            status: "pending",
            participants: [parth._id, alex._id],
            tags: ["birthday"],
          },
          {
            relationshipId: rel1[0]._id,
            createdBy: parth._id,
            type: "study_plan",
            title: "Exam Preparation 📚",
            description: "Study together for upcoming exams.",
            startDate: daysAgo(5),
            endDate: daysAgo(-5),
            priority: "high",
            status: "active",
            progress: 60,
            participants: [parth._id, alex._id],
            tags: ["study"],
          },
          {
            relationshipId: rel1[0]._id,
            createdBy: alex._id,
            type: "habit",
            title: "Nightly Call Routine 🌙",
            description: "Call each other every night at 10pm.",
            recurrence: "daily",
            priority: "high",
            status: "active",
            streakCount: 5,
            longestStreak: 5,
            participants: [parth._id, alex._id],
          },
        ],
        { session },
      );
      console.log("📅  Plans created");
    } catch (err) {
      console.error("❌ Failed at plans:", err.message);
      throw err;
    }

    // ── journal entries (3) ───────────────────────────────────────────────────
    try {
      await JournalEntry.create(
        [
          {
            relationshipId: rel1[0]._id,
            authorId: parth._id,
            type: "gratitude_entry",
            title: "Grateful for You 💕",
            content:
              "Today I felt so grateful for having you in my life. You make every day brighter. I love how you always know what to say when I'm stressed.",
            emotionTag: "grateful",
            visibility: "shared",
            responses: [
              {
                authorId: alex._id,
                content:
                  "This made me cry happy tears 🥺 I feel the same way about you.",
                createdAt: daysAgo(6),
              },
            ],
            reactions: [{ userId: alex._id, emoji: "❤️" }],
            createdAt: daysAgo(7),
          },
        ],
        { session },
      );

      await JournalEntry.create(
        [
          {
            relationshipId: rel1[0]._id,
            authorId: alex._id,
            type: "daily_entry",
            title: "Today's Reflection 🌙",
            content:
              "Had a tough day at work but talking to Parth made everything better. I don't know what I'd do without that support. Feeling calm now.",
            emotionTag: "calm",
            visibility: "shared",
            createdAt: daysAgo(4),
          },
        ],
        { session },
      );

      await JournalEntry.create(
        [
          {
            relationshipId: rel1[0]._id,
            authorId: parth._id,
            type: "future_letter",
            title: "Letter to You — Open in 6 Months 💌",
            content:
              "Hey Alex, if you're reading this, 6 months have passed. I wonder where we are now. I hope we've gone on that trip. I hope we're still laughing every day. I love you.",
            emotionTag: "love",
            visibility: "visible_after_date",
            scheduledOpenDate: daysAgo(-180),
            createdAt: daysAgo(2),
          },
        ],
        { session },
      );
      console.log("📓  Journal entries created");
    } catch (err) {
      console.error("❌ Failed at journal entries:", err.message);
      throw err;
    }

    // ── gifts (2) ─────────────────────────────────────────────────────────────
    try {
      await Gift.insertMany(
        [
          {
            relationshipId: rel1[0]._id,
            senderId: parth._id,
            giftType: "virtual_flower",
            title: "A flower for you 🌸",
            message: "Just because you deserve beautiful things.",
            revealMode: "instant",
            revealAnimation: "floating_hearts",
            opened: true,
            openedAt: daysAgo(5),
            reaction: "❤️",
          },
          {
            relationshipId: rel1[0]._id,
            senderId: alex._id,
            giftType: "encouragement_card",
            title: "You've got this! 💪",
            message:
              "Sending you all my energy for your big day. I believe in you.",
            revealMode: "scheduled",
            scheduledRevealTime: daysAgo(-1),
            revealAnimation: "confetti",
            opened: false,
          },
        ],
        { session },
      );
      console.log("🎁  Gifts created");
    } catch (err) {
      console.error("❌ Failed at gifts:", err.message);
      throw err;
    }

    // ── time capsules (2) ─────────────────────────────────────────────────────
    try {
      await TimeCapsule.insertMany(
        [
          {
            relationshipId: rel1[0]._id,
            creatorId: parth._id,
            capsuleType: "text_letter",
            title: "Open on Our Anniversary 💍",
            message:
              "One year from now, I hope we're still doing this. Still talking every day. Still growing together.",
            openCondition: "specific_date",
            lockedUntil: daysAgo(-335),
            opened: false,
          },
          {
            relationshipId: rel1[0]._id,
            creatorId: alex._id,
            capsuleType: "encouragement_capsule",
            title: "For When You Need It 🌟",
            message:
              "Hey Parth. If you're having a rough day, remember: you are enough. You are loved. Open this whenever you need a reminder.",
            openCondition: "manual_unlock",
            lockedUntil: daysAgo(1),
            opened: true,
            openedAt: daysAgo(1),
          },
        ],
        { session },
      );
      console.log("⏳  Time capsules created");
    } catch (err) {
      console.error("❌ Failed at time capsules:", err.message);
      throw err;
    }

    // ── insights (5) ─────────────────────────────────────────────────────────
    try {
      await RelationshipInsight.insertMany(
        [
          {
            relationshipId: rel1[0]._id,
            insightType: "communication_frequency",
            title: "Strong Communication This Week",
            description:
              "You exchanged 50+ messages this week. Communication is consistent and healthy.",
            score: 85,
            trend: "up",
            period: "weekly",
            periodStart: daysAgo(7),
            periodEnd: new Date(),
          },
          {
            relationshipId: rel1[0]._id,
            insightType: "memory_creation_frequency",
            title: "Memory Creation Increasing",
            description:
              "You created 4 new memories this week — more than last week.",
            score: 78,
            trend: "up",
            period: "weekly",
            periodStart: daysAgo(7),
            periodEnd: new Date(),
          },
          {
            relationshipId: rel1[0]._id,
            insightType: "shared_activity_frequency",
            title: "Shared Activities Growing",
            description:
              "3 shared sessions completed this week. Great engagement!",
            score: 72,
            trend: "up",
            period: "weekly",
            periodStart: daysAgo(7),
            periodEnd: new Date(),
          },
          {
            relationshipId: rel1[0]._id,
            insightType: "positivity_trend",
            title: "Positive Emotional Signals Strong",
            description:
              "Most messages carry happy, romantic, and supportive tones.",
            score: 90,
            trend: "up",
            period: "weekly",
            periodStart: daysAgo(7),
            periodEnd: new Date(),
          },
          {
            relationshipId: rel1[0]._id,
            insightType: "call_frequency",
            title: "Regular Calls Maintained",
            description:
              "5 calls in the past 2 weeks. Voice connection is strong.",
            score: 80,
            trend: "neutral",
            period: "monthly",
            periodStart: daysAgo(30),
            periodEnd: new Date(),
          },
        ],
        { session },
      );

      // AI insights
      await AIInsight.insertMany(
        [
          {
            relationshipId: rel1[0]._id,
            type: "weekly_summary",
            title: "Your Week in Review 📊",
            description:
              "A great week — consistent messages, 2 activities, and 3 new memories.",
            suggestion: "Keep the momentum going!",
            confidence: 0.9,
          },
          {
            relationshipId: rel1[0]._id,
            type: "appreciation_reminder",
            title: "Send an Appreciation Message 💕",
            description: "It's been 2 days since a gratitude message was sent.",
            suggestion: "Try: 'I appreciate you because...'",
            confidence: 0.75,
          },
          {
            relationshipId: rel1[0]._id,
            type: "partner_stressed",
            title: "Partner May Be Stressed 🤍",
            description: "Recent messages suggest Alex may be under pressure.",
            suggestion: "A supportive message could help right now.",
            confidence: 0.68,
          },
        ],
        { session },
      );
      console.log("🧠  Insights created");
    } catch (err) {
      console.error("❌ Failed at insights:", err.message);
      throw err;
    }

    // ── notifications (8) ─────────────────────────────────────────────────────
    try {
      await Notification.insertMany(
        [
          {
            userId: parth._id,
            relationshipId: rel1[0]._id,
            type: "memory_created",
            title: "New Memory Added ✨",
            message: "Alex added 'First Long Call' to your timeline.",
            entityType: "memory",
            read: true,
            priority: "normal",
            createdAt: daysAgo(28),
          },
          {
            userId: alex._id,
            relationshipId: rel1[0]._id,
            type: "message_received",
            title: "New Message 💬",
            message: "Parth: I'm so proud of you! 🎉",
            entityType: "message",
            read: true,
            priority: "normal",
            createdAt: daysAgo(20),
          },
          {
            userId: parth._id,
            relationshipId: rel1[0]._id,
            type: "missed_call",
            title: "Missed Call 📞",
            message: "You missed a call from Alex.",
            entityType: "call",
            read: true,
            priority: "high",
            createdAt: daysAgo(8),
          },
          {
            userId: alex._id,
            relationshipId: rel1[0]._id,
            type: "planner_reminder",
            title: "Reminder: Movie Night 🎬",
            message: "Your weekend movie night is coming up!",
            entityType: "plan",
            read: false,
            priority: "normal",
            createdAt: daysAgo(1),
          },
          {
            userId: parth._id,
            relationshipId: rel1[0]._id,
            type: "memory_reaction",
            title: "Alex reacted to a memory ❤️",
            message: "Alex reacted to 'Our Space Began'",
            entityType: "memory",
            read: false,
            priority: "low",
            createdAt: daysAgo(1),
          },
          {
            userId: alex._id,
            relationshipId: rel1[0]._id,
            type: "relationship_event",
            title: "One Month Together 🎊",
            message: "You and Parth have been connected for 1 month!",
            entityType: "relationship",
            read: false,
            priority: "high",
            createdAt: new Date(),
          },
          {
            userId: parth._id,
            relationshipId: rel1[0]._id,
            type: "activity_invite",
            title: "Activity Invite 🎬",
            message: "Alex started a Watch Together session.",
            entityType: "activity",
            read: false,
            priority: "normal",
            createdAt: hoursAgo(1),
          },
          {
            userId: alex._id,
            relationshipId: rel1[0]._id,
            type: "memory_comment",
            title: "New Comment on Memory 💬",
            message: "Parth commented on 'Our Space Began'.",
            entityType: "memory",
            read: false,
            priority: "low",
            createdAt: hoursAgo(2),
          },
        ],
        { session },
      );
      console.log("🔔  Notifications created");
    } catch (err) {
      console.error("❌ Failed at notifications:", err.message);
      throw err;
    }

    // ── Mood check-ins ─────────────────────────────────────────────────────
    try {
      await MoodEntry.insertMany([
        { relationshipId: rel1[0]._id, userId: parth._id, emoji: "🥰", note: "Thinking of you today", checkedInAt: new Date() },
        { relationshipId: rel1[0]._id, userId: alex._id,  emoji: "😄", note: "Good day overall!", checkedInAt: new Date() },
        { relationshipId: rel1[0]._id, userId: parth._id, emoji: "😌", note: "", checkedInAt: daysAgo(1) },
        { relationshipId: rel1[0]._id, userId: alex._id,  emoji: "😴", note: "Long day...", checkedInAt: daysAgo(1) },
      ]);
      console.log("🌤️  Mood entries created");
    } catch (err) {
      console.error("❌ Failed at mood entries:", err.message);
      // Non-critical — continue
    }

    // Commit transaction
    await session.commitTransaction();
    console.log("✅  Transaction committed");

    // Count all created entities
    const messageCount = await Message.countDocuments({
      relationshipId: rel1[0]._id,
    });
    const memoryCount = await Memory.countDocuments({
      relationshipId: rel1[0]._id,
    });
    const activityCount = await Activity.countDocuments({
      relationshipId: rel1[0]._id,
    });
    const planCount = await Plan.countDocuments({
      relationshipId: rel1[0]._id,
    });
    const journalCount = await JournalEntry.countDocuments({
      relationshipId: rel1[0]._id,
    });
    const giftCount = await Gift.countDocuments({
      relationshipId: rel1[0]._id,
    });
    const capsuleCount = await TimeCapsule.countDocuments({
      relationshipId: rel1[0]._id,
    });

    // ── done ──────────────────────────────────────────────────────────────────
    console.log("\n✅  Demo seed complete!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("  Login as: parth.demo@example.com");
    console.log("  Password: Demo@123");
    console.log("  Or:       alex.demo@example.com");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`
📊 Seed Summary:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Users:              2
Relationships:      2
Messages:           ${messageCount}
Memories:           ${memoryCount}
Activities:         ${activityCount}
Plans:              ${planCount}
Journal Entries:    ${journalCount}
Gifts:              ${giftCount}
Time Capsules:      ${capsuleCount}
Calls:              6
Insights:           8
Notifications:      8
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
  } catch (err) {
    await session.abortTransaction();
    console.error("❌  Transaction aborted due to error:", err.message);
    throw err;
  } finally {
    session.endSession();
    await mongoose.disconnect();
  }
}

seed().catch((err) => {
  console.error("❌  Seed failed:", err.message);
  process.exit(1);
});
