import Story from "./story.model.js";
import { verifyRelationshipMember } from "../../shared/utils/relationshipValidator.js";
import Relationship from "../relationship/relationship.model.js";
import {
  generateMonthlyStory, generateJourneyStory,
  generateAnniversaryStory, generateMilestoneStory,
} from "./story.generator.js";


export const listStories = async (req, res) => {
  const { relationshipId, limit = 20 } = req.query;
  try {
    const rel = await verifyRelationshipMember(relationshipId, req.user.userId);
    if (!rel) return res.status(403).json({ error: true, message: "Access denied" });

    const stories = await Story.find({ relationshipId, hidden: false })
      .sort({ generatedAt: -1 })
      .limit(Number(limit));
    res.json({ stories });
  } catch {
    res.status(500).json({ error: true, message: "Failed to fetch stories" });
  }
};

export const getStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.storyId);
    if (!story) return res.status(404).json({ error: true, message: "Not found" });
    const rel = await verifyRelationshipMember(story.relationshipId, req.user.userId);
    if (!rel) return res.status(403).json({ error: true, message: "Access denied" });
    res.json(story);
  } catch {
    res.status(500).json({ error: true, message: "Failed to fetch story" });
  }
};

export const generateStory = async (req, res) => {
  const { relationshipId, storyType = "monthly" } = req.body;
  try {
    const rel = await verifyRelationshipMember(relationshipId, req.user.userId);
    if (!rel) return res.status(403).json({ error: true, message: "Access denied" });

    let story;
    switch (storyType) {
      case "monthly":     story = await generateMonthlyStory(relationshipId);     break;
      case "journey":     story = await generateJourneyStory(relationshipId);     break;
      case "anniversary": story = await generateAnniversaryStory(relationshipId); break;
      default:            return res.status(422).json({ error: true, message: "Unknown story type" });
    }

    if (!story) return res.status(422).json({ error: true, message: "Insufficient data to generate story" });
    res.status(201).json(story);
  } catch {
    res.status(500).json({ error: true, message: "Story generation failed" });
  }
};

export const updateStory = async (req, res) => {
  const { title, favorited, hidden } = req.body;
  try {
    const story = await Story.findById(req.params.storyId);
    if (!story) return res.status(404).json({ error: true, message: "Not found" });
    const rel = await verifyRelationshipMember(story.relationshipId, req.user.userId);
    if (!rel) return res.status(403).json({ error: true, message: "Access denied" });

    if (title !== undefined)    story.title    = title.slice(0, 120);
    if (favorited !== undefined) story.favorited = favorited;
    if (hidden !== undefined)    story.hidden    = hidden;
    await story.save();
    res.json(story);
  } catch {
    res.status(500).json({ error: true, message: "Failed to update story" });
  }
};
