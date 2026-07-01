import mongoose from "mongoose";
import { PERSONALIZATION_DEFAULTS as D } from "../../shared/constants/themes.js";

const personalizationSchema = new mongoose.Schema(
  {
    relationshipId:  { type: mongoose.Schema.Types.ObjectId, ref: "Relationship", unique: true, required: true },
    relationshipName:{ type: String, default: D.relationshipName, maxlength: 60 },
    theme:           { type: String, default: D.theme },
    accentColor:     { type: String, default: D.accentColor },
    fontStyle:       { type: String, default: D.fontStyle },
    animationLevel:  { type: String, enum: ["normal","reduced","disabled"], default: D.animationLevel },
    sharedWallpaper: { type: String, default: D.sharedWallpaper },
    backgroundStyle: { type: String, enum: ["solid","gradient","wallpaper"], default: D.backgroundStyle },
    chatBubbleStyle: { type: String, default: D.chatBubbleStyle },
    memoryCardStyle: { type: String, default: D.memoryCardStyle },
    emojiStyle:      { type: String, default: D.emojiStyle },
    soundTheme:      { type: String, default: D.soundTheme },
    visualMood:      { type: String, default: D.visualMood },
    anniversaryTheme:{ type: String, default: D.anniversaryTheme },
  },
  { timestamps: true }
);

const Personalization = mongoose.model("Personalization", personalizationSchema);
export default Personalization;
