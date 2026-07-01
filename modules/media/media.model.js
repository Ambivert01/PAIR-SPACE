import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
  {
    uploaderId:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    relationshipId: { type: mongoose.Schema.Types.ObjectId, ref: "Relationship", default: null },
    context: {
      type: String,
      enum: ["chat", "memory", "profile", "voice", "video"],
      required: true,
    },
    type: {
      type: String,
      enum: ["image", "video", "audio", "file"],
      required: true,
    },
    fileName:     { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType:     { type: String, required: true },
    size:         { type: Number, required: true },
    url:          { type: String, required: true },
    thumbnailUrl: { type: String, default: "" },
    duration:     { type: Number, default: 0 },
    width:        { type: Number, default: 0 },
    height:       { type: Number, default: 0 },
    deleted:      { type: Boolean, default: false },
  },
  { timestamps: true }
);

mediaSchema.index({ uploaderId: 1 });
mediaSchema.index({ relationshipId: 1 });

const Media = mongoose.model("Media", mediaSchema);

export default Media;
