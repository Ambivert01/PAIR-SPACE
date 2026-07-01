import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    relationshipId: { type: mongoose.Schema.Types.ObjectId, ref: "Relationship", required: true },
    storyType: {
      type: String,
      enum: ["monthly","milestone","anniversary","journey","activity","growth","custom"],
      required: true,
    },
    title:      { type: String, required: true, maxlength: 120 },
    narrative:  { type: String, required: true, maxlength: 3000 },
    highlights: [{ icon: String, label: String, value: String }],
    periodStart:{ type: Date, default: null },
    periodEnd:  { type: Date, default: null },
    metadata:   { type: mongoose.Schema.Types.Mixed, default: {} },
    favorited:  { type: Boolean, default: false },
    hidden:     { type: Boolean, default: false },
    generatedAt:{ type: Date, default: Date.now },
  },
  { timestamps: true }
);

storySchema.index({ relationshipId: 1, generatedAt: -1 });
storySchema.index({ relationshipId: 1, storyType: 1 });

const Story = mongoose.model("Story", storySchema);
export default Story;
