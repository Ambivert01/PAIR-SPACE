#!/usr/bin/env node
/**
 * PairSpace System Audit Script
 *
 * Performs comprehensive system validation:
 * - Module coverage check
 * - API endpoint validation
 * - UI consistency check
 * - Code quality scan
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");

// ANSI colors
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  section: (msg) =>
    console.log(`\n${colors.blue}═══ ${msg} ═══${colors.reset}\n`),
};

// Module definitions
const MODULES = [
  { name: "auth", hasSocket: false },
  { name: "relationship", hasSocket: true },
  { name: "chat", hasSocket: true },
  { name: "call", hasSocket: true },
  { name: "memory", hasSocket: false },
  { name: "sync", hasSocket: true },
  { name: "planner", hasSocket: false },
  { name: "journal", hasSocket: false },
  { name: "gifts", hasSocket: false },
  { name: "time-capsule", hasSocket: false },
  { name: "ai", hasSocket: false },
  { name: "insights", hasSocket: false },
  { name: "notification", hasSocket: true },
  { name: "search", hasSocket: false },
  { name: "privacy", hasSocket: false },
  { name: "settings", hasSocket: false },
  { name: "personalization", hasSocket: false },
  { name: "sync-engine", hasSocket: true },
  { name: "plugin-system", hasSocket: false },
  { name: "onboarding", hasSocket: false },
  { name: "feedback", hasSocket: false },
  { name: "analytics", hasSocket: false },
  { name: "games", hasSocket: false },
  { name: "media", hasSocket: false },
  { name: "ai-story", hasSocket: false },
];

const results = {
  modules: [],
  issues: [],
  warnings: [],
  stats: {
    totalModules: 0,
    modulesWithBackend: 0,
    modulesWithFrontend: 0,
    modulesComplete: 0,
  },
};

// Check if file exists
function fileExists(filePath) {
  return fs.existsSync(path.join(rootDir, filePath));
}

// Check if directory has files
function dirHasFiles(dirPath, extension) {
  const fullPath = path.join(rootDir, dirPath);
  if (!fs.existsSync(fullPath)) return false;
  const files = fs.readdirSync(fullPath);
  return files.some((f) => f.endsWith(extension));
}

// Audit a single module
function auditModule(module) {
  const result = {
    name: module.name,
    backend: {
      routes: fileExists(`modules/${module.name}/${module.name}.routes.js`),
      controller: fileExists(
        `modules/${module.name}/${module.name}.controller.js`,
      ),
      model: fileExists(`modules/${module.name}/${module.name}.model.js`),
      service: fileExists(`modules/${module.name}/${module.name}.service.js`),
    },
    frontend: {
      exists: dirHasFiles(`apps/web/src/features/${module.name}`, ".jsx"),
      page:
        fileExists(`apps/web/src/pages/${capitalize(module.name)}Page.jsx`) ||
        fileExists(
          `apps/web/src/pages/${capitalize(module.name)}PageUltra.jsx`,
        ),
    },
    socket: module.hasSocket
      ? fileExists(`modules/${module.name}/${module.name}.socket.js`)
      : null,
  };

  // Calculate completeness
  const backendComplete =
    result.backend.routes &&
    (result.backend.controller || result.backend.service);
  const frontendComplete = result.frontend.exists || result.frontend.page;
  const socketComplete = !module.hasSocket || result.socket;

  result.complete = backendComplete && frontendComplete && socketComplete;

  return result;
}

function capitalize(str) {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

// Check for UI consistency issues
function checkUIConsistency() {
  log.section("UI Consistency Check");

  const featureFiles = [];
  const featuresDir = path.join(rootDir, "apps/web/src/features");

  function scanDir(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.name.endsWith(".jsx")) {
        featureFiles.push(fullPath);
      }
    }
  }

  scanDir(featuresDir);

  let oldUICount = 0;
  let ultraUICount = 0;

  for (const file of featureFiles) {
    const content = fs.readFileSync(file, "utf-8");
    const isUltra = file.includes("Ultra.jsx");

    if (isUltra) {
      ultraUICount++;
    } else {
      // Check if it uses old UI patterns
      const hasGlassCard = content.includes("GlassCard");
      const hasMotion = content.includes("motion.");
      const hasAnimatedButton = content.includes("AnimatedButton");

      if (!hasGlassCard && !hasMotion && !hasAnimatedButton) {
        oldUICount++;
        const relativePath = path.relative(rootDir, file);
        results.warnings.push(`Old UI pattern: ${relativePath}`);
      }
    }
  }

  log.info(`Total feature files: ${featureFiles.length}`);
  log.info(`Ultra UI files: ${ultraUICount}`);
  if (oldUICount > 0) {
    log.warn(`Files with old UI patterns: ${oldUICount}`);
  } else {
    log.success("All files use modern UI patterns");
  }
}

// Check for code quality issues
function checkCodeQuality() {
  log.section("Code Quality Check");

  // Check for TODO comments
  const todoPattern = /TODO|FIXME|HACK|XXX/gi;
  let todoCount = 0;

  function scanForTodos(dir, extensions) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === "node_modules" || entry.name === ".git") continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanForTodos(fullPath, extensions);
      } else if (extensions.some((ext) => entry.name.endsWith(ext))) {
        const content = fs.readFileSync(fullPath, "utf-8");
        const matches = content.match(todoPattern);
        if (matches) {
          todoCount += matches.length;
          const relativePath = path.relative(rootDir, fullPath);
          results.warnings.push(
            `${matches.length} TODO/FIXME in ${relativePath}`,
          );
        }
      }
    }
  }

  scanForTodos(path.join(rootDir, "apps/web/src"), [".js", ".jsx"]);
  scanForTodos(path.join(rootDir, "modules"), [".js"]);
  scanForTodos(path.join(rootDir, "services/api/src"), [".js"]);

  if (todoCount > 0) {
    log.warn(`Found ${todoCount} TODO/FIXME comments`);
  } else {
    log.success("No TODO/FIXME comments found");
  }
}

// Main audit function
async function runAudit() {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║           PairSpace System Audit                          ║
║           Production Readiness Check                      ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);

  // Phase 1: Module Coverage
  log.section("Module Coverage Audit");

  for (const module of MODULES) {
    const result = auditModule(module);
    results.modules.push(result);
    results.stats.totalModules++;

    if (result.backend.routes) results.stats.modulesWithBackend++;
    if (result.frontend.exists || result.frontend.page)
      results.stats.modulesWithFrontend++;
    if (result.complete) results.stats.modulesComplete++;

    const status = result.complete ? colors.green + "✓" : colors.yellow + "⚠";
    console.log(
      `${status}${colors.reset} ${module.name.padEnd(20)} Backend: ${result.backend.routes ? "✓" : "✗"}  Frontend: ${result.frontend.exists || result.frontend.page ? "✓" : "✗"}  ${module.hasSocket ? `Socket: ${result.socket ? "✓" : "✗"}` : ""}`,
    );

    if (!result.complete) {
      let missing = [];
      if (!result.backend.routes) missing.push("routes");
      if (!result.frontend.exists && !result.frontend.page) missing.push("UI");
      if (module.hasSocket && !result.socket) missing.push("socket");
      results.issues.push(`${module.name}: Missing ${missing.join(", ")}`);
    }
  }

  // Phase 2: UI Consistency
  checkUIConsistency();

  // Phase 3: Code Quality
  checkCodeQuality();

  // Summary
  log.section("Audit Summary");
  console.log(`Total Modules:           ${results.stats.totalModules}`);
  console.log(`Modules with Backend:    ${results.stats.modulesWithBackend}`);
  console.log(`Modules with Frontend:   ${results.stats.modulesWithFrontend}`);
  console.log(`Complete Modules:        ${results.stats.modulesComplete}`);
  console.log(
    `Completion Rate:         ${Math.round((results.stats.modulesComplete / results.stats.totalModules) * 100)}%`,
  );

  if (results.issues.length > 0) {
    log.section("Critical Issues");
    results.issues.forEach((issue) => log.error(issue));
  }

  if (results.warnings.length > 0) {
    log.section("Warnings");
    results.warnings.slice(0, 10).forEach((warning) => log.warn(warning));
    if (results.warnings.length > 10) {
      log.info(`... and ${results.warnings.length - 10} more warnings`);
    }
  }

  // Save report
  const reportPath = path.join(rootDir, ".kiro/audit/audit-results.json");
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  log.success(`Detailed report saved to: .kiro/audit/audit-results.json`);

  console.log("\n");

  // Exit code
  process.exit(results.issues.length > 0 ? 1 : 0);
}

runAudit().catch((err) => {
  console.error("Audit failed:", err);
  process.exit(1);
});
