import { Router } from "express";
import authMiddleware from "../../services/api/src/middleware/authMiddleware.js";
import {
  listPlugins, enablePluginHandler, disablePluginHandler,
  updatePluginConfig, getPluginsByTypeHandler,
} from "./plugin.controller.js";

const router = Router();
router.use(authMiddleware);

router.get("/",              listPlugins);
router.get("/type/:type",    getPluginsByTypeHandler);
router.post("/enable",       enablePluginHandler);
router.post("/disable",      disablePluginHandler);
router.patch("/config",      updatePluginConfig);

export default router;
