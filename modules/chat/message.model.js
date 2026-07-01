import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    relationshipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Relationship",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["text", "image", "video", "voice", "audio", "gif", "file", "location", "memory_reference", "activity_invite", "system"],
      default: "text",
    },
    content: { type: String, maxlength: 2000, default: "" },
    mediaUrl:     { type: String, default: "" },
    thumbnailUrl: { type: String, default: "" },
    replyToMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    reactions: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        emoji:  { type: String },
      },
    ],
    edited:  { type: Boolean, default: false },
    deleted: { type: Boolean, default: false },
    metadata: {
      duration: { type: Number, default: 0 },
      fileSize: { type: Number, default: 0 },
      mimeType: { type: String, default: "" },
      width:    { type: Number, default: 0 },
      height:   { type: Number, default: 0 },
      location: {
        lat:  { type: Number, default: null },
        lng:  { type: Number, default: null },
        name: { type: String, default: "" },
      },
    },
    status: {
      type: String,
      enum: ["sending", "sent", "delivered", "read"],
      default: "sent",
    },
  },
  { timestamps: true }
);

messageSchema.index({ relationshipId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1 });
messageSchema.index({ replyToMessageId: 1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;
