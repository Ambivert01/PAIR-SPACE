import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    userId:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sessionToken: { type: String, required: true, unique: true },
    device:       { type: String, default: "unknown" },
    ipAddress:    { type: String, default: "" },
    lastActiveAt: { type: Date, default: Date.now },
    revoked:      { type: Boolean, default: false },
    expiresAt:    { type: Date, required: true },
  },
  { timestamps: true }
);

sessionSchema.index({ userId: 1, revoked: 1 });
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL auto-cleanup

const Session = mongoose.model("Session", sessionSchema);
export default Session;
