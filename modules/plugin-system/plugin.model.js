import mongoose from "mongoose";
import { PLUGIN_TYPES } from "../../shared/plugin-types/pluginInterfaces.js";

const pluginSchema = new mongoose.Schema(
  {
    pluginName:   { type: String, required: true, unique: true },
    pluginType:   { type: String, enum: PLUGIN_TYPES, required: true },
    version:      { type: String, required: true },
    description:  { type: String, default: "" },
    author:       { type: String, default: "" },
    enabled:      { type: Boolean, default: false },
    config:       { type: mongoose.Schema.Types.Mixed, default: {} },
    configSchema: { type: mongoose.Schema.Types.Mixed, default: {} },
    installedAt:  { type: Date, default: Date.now },
    lastError:    { type: String, default: "" },
  },
  { timestamps: true }
);

const Plugin = mongoose.model("Plugin", pluginSchema);
export default Plugin;
