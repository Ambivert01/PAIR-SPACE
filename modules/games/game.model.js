import mongoose from "mongoose";

const GAME_TYPES = [
  "tic_tac_toe","truth_or_dare","this_or_that","quiz_about_partner",
  "emoji_story_game","draw_and_guess","daily_question_game",
  "compatibility_quiz","future_prediction_game","custom_prompt_game",
];

const gameSchema = new mongoose.Schema(
  {
    relationshipId: { type: mongoose.Schema.Types.ObjectId, ref: "Relationship", required: true },
    gameType:       { type: String, enum: GAME_TYPES, required: true },
    createdBy:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    players:        [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    currentTurn:    { type: String, default: null },
    state:          { type: mongoose.Schema.Types.Mixed, default: {} },
    result:         { type: mongoose.Schema.Types.Mixed, default: null },
    status: {
      type: String,
      enum: ["waiting","active","completed","abandoned"],
      default: "waiting",
    },
  },
  { timestamps: true }
);

gameSchema.index({ relationshipId: 1, createdAt: -1 });

const GameSession = mongoose.model("GameSession", gameSchema);
export default GameSession;
