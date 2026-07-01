import User from "../../../../modules/auth/user.model.js";

/**
 * adminMiddleware — ensures the requesting user has role === "admin".
 * Must be used AFTER authMiddleware (which sets req.user.userId).
 */
const adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select("role isActive");
    if (!user || !user.isActive) {
      return res.status(401).json({ error: true, message: "Unauthorized" });
    }
    if (user.role !== "admin") {
      return res.status(403).json({ error: true, message: "Admin access required" });
    }
    req.user.role = "admin";
    next();
  } catch {
    res.status(500).json({ error: true, message: "Authorization check failed" });
  }
};

export default adminMiddleware;
