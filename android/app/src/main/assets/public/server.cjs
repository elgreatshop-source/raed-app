var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_cors = __toESM(require("cors"), 1);
var import_genai = require("@google/genai");
import_dotenv.default.config();
var currentDir = typeof __dirname !== "undefined" ? __dirname : process.cwd();
var app = (0, import_express.default)();
var PORT = Number(process.env.PORT) || 3e3;
var allowedOrigins = [
  "http://localhost",
  "http://localhost:5173",
  "http://localhost:3000",
  "https://localhost",
  "capacitor://localhost"
];
if (process.env.ALLOWED_ORIGIN) {
  process.env.ALLOWED_ORIGIN.split(",").forEach((origin) => {
    const trimmed = origin.trim();
    if (trimmed && !allowedOrigins.includes(trimmed)) {
      allowedOrigins.push(trimmed);
    }
  });
}
app.use(
  (0, import_cors.default)({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || origin.endsWith(".run.app")) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true
  })
);
app.use(import_express.default.json({ limit: "30mb" }));
app.use(import_express.default.urlencoded({ extended: true, limit: "30mb" }));
app.use((err, req, res, next) => {
  if (err.type === "entity.too.large" || err.status === 413) {
    return res.status(413).json({
      success: false,
      status: 413,
      error: "\u062D\u062C\u0645 \u0627\u0644\u0645\u0644\u0641 \u0623\u0648 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u0631\u0641\u0642\u0629 \u064A\u062A\u062C\u0627\u0648\u0632 \u0627\u0644\u062D\u062F \u0627\u0644\u0623\u0642\u0635\u0649 \u0627\u0644\u0645\u0633\u0645\u0648\u062D \u0628\u0647 (30 \u0645\u064A\u063A\u0627\u0628\u0627\u064A\u062A). \u064A\u0631\u062C\u0649 \u062A\u0642\u0644\u064A\u0644 \u062D\u062C\u0645 \u0627\u0644\u0645\u0644\u0641 \u0648\u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0645\u062C\u062F\u062F\u0627\u064B."
    });
  }
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({
      success: false,
      status: 400,
      error: "\u0635\u064A\u063A\u0629 \u0627\u0644\u0637\u0644\u0628 \u0623\u0648 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u0631\u0633\u0644\u0629 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D\u0629 (Invalid JSON Payload)."
    });
  }
  next(err);
});
var rateLimitMap = /* @__PURE__ */ new Map();
var RATE_LIMIT_WINDOW_MS = 60 * 1e3;
var MAX_REQUESTS_PER_WINDOW = 25;
function rateLimiter(req, res, next) {
  const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown-client";
  const now = Date.now();
  const record = rateLimitMap.get(clientIp) || { timestamps: [] };
  const validTimestamps = record.timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    res.status(429).json({
      success: false,
      error: "\u0644\u0642\u062F \u062A\u062C\u0627\u0648\u0632\u062A \u0627\u0644\u062D\u062F \u0627\u0644\u0623\u0642\u0635\u0649 \u0627\u0644\u0645\u0633\u0645\u0648\u062D \u0628\u0647 \u0645\u0646 \u0627\u0644\u0637\u0644\u0628\u0627\u062A \u0645\u0624\u0642\u062A\u0627\u064B. \u064A\u0631\u062C\u0649 \u0627\u0644\u0627\u0646\u062A\u0638\u0627\u0631 \u062F\u0642\u064A\u0642\u0629 \u0648\u0627\u062D\u062F\u0629 \u062B\u0645 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0645\u0631\u0629 \u0623\u062E\u0631\u0649."
    });
    return;
  }
  validTimestamps.push(now);
  rateLimitMap.set(clientIp, { timestamps: validTimestamps });
  next();
}
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    const valid = record.timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
    if (valid.length === 0) {
      rateLimitMap.delete(ip);
    } else {
      rateLimitMap.set(ip, { timestamps: valid });
    }
  }
}, 10 * 60 * 1e3);
function sanitizeInput(str) {
  if (typeof str !== "string") return "";
  return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "").replace(/<[^>]+>/g, "").replace(/javascript:/gi, "").trim().slice(0, 15e3);
}
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing.");
  }
  return new import_genai.GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
}
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "raed-backend",
    environment: process.env.NODE_ENV || "development",
    serverTime: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.post("/api/ai/generate-pedagogical-pack", rateLimiter, async (req, res) => {
  try {
    const {
      phase,
      // 'intensive_remediation' | 'explicit_instruction'
      date,
      dayName,
      teacherProfile,
      arabicLessonInput,
      mathLessonInput,
      frenchLessonInput,
      customInstructions,
      imagesBase64,
      // Array of { data: string, mimeType: string }
      documentsText,
      // Array of { name: string, type: string, text: string } from Word/PowerPoint/Excel/Text
      timetable
      // WeeklyTimetable object
    } = req.body;
    const cleanPhase = phase === "explicit_instruction" ? "explicit_instruction" : "intensive_remediation";
    const cleanDate = sanitizeInput(date) || (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const cleanDayName = sanitizeInput(dayName) || "\u0627\u0644\u064A\u0648\u0645 \u0627\u0644\u062F\u0631\u0627\u0633\u064A";
    const cleanArabicInput = sanitizeInput(arabicLessonInput);
    const cleanMathInput = sanitizeInput(mathLessonInput);
    const cleanFrenchInput = sanitizeInput(frenchLessonInput);
    const cleanCustomInstructions = sanitizeInput(customInstructions);
    let attachedDocsSection = "";
    if (documentsText && Array.isArray(documentsText) && documentsText.length > 0) {
      attachedDocsSection = "\n\n\u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0648\u0627\u0644\u062F\u0631\u0648\u0633 \u0627\u0644\u0631\u0642\u0645\u064A\u0629 \u0627\u0644\u0645\u0631\u0641\u0642\u0629 \u0645\u0646 \u0642\u0628\u0644 \u0627\u0644\u0623\u0633\u062A\u0627\u0630 (Word / PowerPoint / Excel / TXT):\n" + documentsText.map((doc, idx) => `--- [\u0627\u0644\u062F\u0631\u0633 \u0627\u0644\u0631\u0642\u0645\u064A / \u0627\u0644\u0648\u062B\u064A\u0642\u0629 ${idx + 1}]: ${sanitizeInput(doc.name || "\u0645\u0644\u0641")} (${doc.type || "\u0648\u062B\u064A\u0642\u0629"}) ---
${sanitizeInput(doc.text || "")}`).join("\n\n");
    }
    const cleanProfile = {
      level: sanitizeInput(teacherProfile?.level) || "\u0627\u0644\u0645\u0633\u062A\u0648\u0649 \u0627\u0644\u0631\u0627\u0628\u0639",
      classGroup: sanitizeInput(teacherProfile?.classGroup) || "1",
      academy: sanitizeInput(teacherProfile?.academy) || "\u0645\u0631\u0627\u0643\u0634 - \u0622\u0633\u0641\u064A",
      direction: sanitizeInput(teacherProfile?.direction) || "\u0627\u0644\u064A\u0648\u0633\u0641\u064A\u0629",
      school: sanitizeInput(teacherProfile?.school) || "\u0645\u062F\u0631\u0633\u0629 \u0627\u0644\u0631\u064A\u0627\u062F\u0629",
      teacherName: sanitizeInput(teacherProfile?.teacherName) || "\u0627\u0644\u0623\u0633\u062A\u0627\u0630(\u0629)",
      teachingMode: sanitizeInput(teacherProfile?.teachingMode) || "bilingual"
    };
    let timetableContext = "";
    if (timetable && Array.isArray(timetable.slots)) {
      const daySlots = timetable.slots.filter(
        (s) => s.day === cleanDayName || s.day === dayName
      );
      if (daySlots.length > 0) {
        timetableContext = `

\u062C\u062F\u0648\u0644 \u0627\u0644\u062D\u0635\u0635 \u0627\u0644\u0645\u0639\u062A\u0645\u062F \u0644\u0644\u0623\u0633\u062A\u0627\u0630 \u0641\u064A \u0627\u0633\u062A\u0639\u0645\u0627\u0644 \u0627\u0644\u0632\u0645\u0646 \u0644\u0647\u0630\u0627 \u0627\u0644\u064A\u0648\u0645 (${cleanDayName}):
` + daySlots.map((s, idx) => `- \u0627\u0644\u062D\u0635\u0629 ${idx + 1}: ${s.time} | \u0627\u0644\u0645\u0627\u062F\u0629: ${s.subject} | \u0627\u0644\u0641\u0648\u062C: ${s.group || cleanProfile.classGroup}`).join("\n");
      }
    }
    const ai = getGeminiClient();
    const teachingModeLabels = {
      bilingual: "\u0623\u0633\u062A\u0627\u0630 \u0645\u0632\u062F\u0648\u062C / \u0634\u0627\u0645\u0644 (\u064A\u062F\u0631\u0633 \u062C\u0645\u064A\u0639 \u0627\u0644\u0645\u0648\u0627\u062F: \u0639\u0631\u0628\u064A\u0629 + \u0641\u0631\u0646\u0633\u064A\u0629 + \u0631\u064A\u0627\u0636\u064A\u0627\u062A \u0644\u0646\u0641\u0633 \u0627\u0644\u0641\u0648\u062C)",
      binome_french_math: "\u0623\u0633\u062A\u0627\u0630 \u0641\u0631\u0646\u0633\u064A\u0629 \u0648\u0631\u064A\u0627\u0636\u064A\u0627\u062A \u0628\u0627\u0644\u062A\u0641\u0648\u064A\u062C (\u0641\u0648\u062C 1 \u0648\u0641\u0648\u062C 2)",
      binome_arabic: "\u0623\u0633\u062A\u0627\u0630 \u0644\u063A\u0629 \u0639\u0631\u0628\u064A\u0629 \u0628\u0627\u0644\u062A\u0641\u0648\u064A\u062C (\u0641\u0648\u062C 1 \u0648\u0641\u0648\u062C 2)",
      specialist_arabic: "\u062A\u062E\u0635\u0635 \u0645\u0627\u062F\u0629 \u0648\u062D\u064A\u062F\u0629: \u0644\u063A\u0629 \u0639\u0631\u0628\u064A\u0629 (\u0623\u0641\u0648\u0627\u062C \u0645\u062A\u0639\u062F\u062F\u0629)",
      specialist_french: "\u062A\u062E\u0635\u0635 \u0645\u0627\u062F\u0629 \u0648\u062D\u064A\u062F\u0629: \u0644\u063A\u0629 \u0641\u0631\u0646\u0633\u064A\u0629 (\u0623\u0641\u0648\u0627\u062C \u0645\u062A\u0639\u062F\u062F\u0629)",
      specialist_math: "\u062A\u062E\u0635\u0635 \u0645\u0627\u062F\u0629 \u0648\u062D\u064A\u062F\u0629: \u0631\u064A\u0627\u0636\u064A\u0627\u062A (\u0623\u0641\u0648\u0627\u062C \u0645\u062A\u0639\u062F\u062F\u0629)"
    };
    const promptText = `
\u0623\u0646\u062A \u062E\u0628\u064A\u0631 \u0628\u064A\u062F\u0627\u063A\u0648\u062C\u064A \u0648\u0645\u0641\u062A\u0634 \u062A\u0631\u0628\u0648\u064A \u0645\u062A\u062E\u0635\u0635 \u0641\u064A \u0645\u0642\u0627\u0631\u0628\u0629 "\u0645\u062F\u0627\u0631\u0633 \u0627\u0644\u0631\u064A\u0627\u062F\u0629" (\xC9coles Pionni\xE8res) \u0628\u0627\u0644\u0645\u063A\u0631\u0628\u060C \u0648\u0645\u062E\u062A\u0635 \u0641\u064A \u0645\u0642\u0627\u0631\u0628\u0629 \u0627\u0644\u062A\u062F\u0631\u064A\u0633 \u0627\u0644\u0635\u0631\u064A\u062D (Enseignement Explicite) \u0648\u0637\u0627\u0631\u0644 (TaRL) \u0644\u0644\u062F\u0639\u0645 \u0627\u0644\u0645\u0643\u062B\u0641 \u0644\u062A\u0639\u0644\u0645\u0627\u062A \u0627\u0644\u0623\u0633\u0627\u0633.

\u0627\u0644\u0645\u0637\u0644\u0648\u0628:
\u062A\u062D\u0644\u064A\u0644 \u062C\u0645\u064A\u0639 \u0627\u0644\u0648\u062B\u0627\u0626\u0642 \u0648\u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0648\u0627\u0644\u062F\u0631\u0648\u0633 \u0627\u0644\u0631\u0642\u0645\u064A\u0629 \u0627\u0644\u0645\u0631\u0641\u0648\u0639\u0629 \u0628\u062F\u0642\u0629 \u0628\u064A\u062F\u0627\u063A\u0648\u062C\u064A\u0629 \u0628\u0627\u0644\u063A\u0629:
1. \u0642\u0631\u0627\u0621\u0629 \u0648\u0641\u062D\u0635 \u0645\u062D\u062A\u0648\u0649 \u0643\u0644 \u0648\u062B\u064A\u0642\u0629 \u0628\u0639\u0646\u0627\u064A\u0629\u060C \u0648\u0627\u0633\u062A\u062E\u0631\u0627\u062C \u0627\u0644\u0645\u0641\u0627\u0647\u064A\u0645 \u0648\u0627\u0644\u0623\u0647\u062F\u0627\u0641 \u0648\u0627\u0644\u0623\u0646\u0634\u0637\u0629 \u0627\u0644\u0645\u0647\u0645\u0629.
2. \u062A\u062D\u0644\u064A\u0644 \u0643\u0644 \u0648\u062B\u064A\u0642\u0629 \u0628\u0634\u0643\u0644 \u0645\u0646\u0641\u0635\u0644 \u0648\u0641\u0647\u0645 \u0627\u0644\u0639\u0644\u0627\u0642\u0629 \u0648\u0627\u0644\u062A\u0643\u0627\u0645\u0644 \u0628\u064A\u0646 \u0627\u0644\u0648\u062B\u0627\u0626\u0642 \u0648\u062F\u0645\u062C \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0639\u0646\u062F \u0627\u0644\u062D\u0627\u062C\u0629.
3. \u0627\u0644\u0627\u0639\u062A\u0645\u0627\u062F \u0627\u0644\u062D\u0642\u064A\u0642\u064A \u0648\u0627\u0644\u0635\u0627\u0631\u0645 \u0639\u0644\u0649 \u0645\u062D\u062A\u0648\u0649 \u0627\u0644\u0648\u062B\u0627\u0626\u0642 \u0648\u0627\u0644\u062F\u0631\u0648\u0633 \u0627\u0644\u0631\u0642\u0645\u064A\u0629 \u0627\u0644\u0645\u0631\u0641\u0648\u0639\u0629 \u0641\u0639\u0644\u0627\u064B \u062F\u0648\u0646 \u0627\u062E\u062A\u0644\u0627\u0642 \u0623\u0648 \u062A\u062E\u0645\u064A\u0646 \u0623\u064A \u0645\u0639\u0644\u0648\u0645\u0627\u062A \u063A\u064A\u0631 \u0648\u0627\u0631\u062F\u0629 \u0641\u064A\u0647\u0627.
4. \u0625\u0639\u062F\u0627\u062F "\u062E\u0637\u0627\u0637\u0629 \u0630\u0647\u0646\u064A\u0629 \u062F\u0642\u064A\u0642\u0629 \u0644\u0643\u0644 \u062F\u0631\u0633 \u0631\u0642\u0645\u064A \u062D\u0633\u0628 \u0627\u0644\u0645\u0627\u062F\u0629":
   - "\u0627\u0644\u062E\u0637\u0627\u0637\u0629 \u0627\u0644\u0630\u0647\u0646\u064A\u0629 \u0644\u062F\u0631\u0633 \u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629" (\u0648\u0641\u0642 \u0646\u0645\u0648\u0630\u062C \u0627\u0644\u062A\u062F\u0631\u064A\u0633 \u0627\u0644\u0635\u0631\u064A\u062D: \u0627\u0641\u062A\u062A\u0627\u062D\u060C \u0646\u0634\u0627\u0637 \u0627\u0644\u0642\u0631\u0627\u0621\u0629 [\u0646\u0645\u0630\u062C\u0629\u060C \u0645\u0645\u0627\u0631\u0633\u0629 \u0645\u0648\u062C\u0647\u0629\u060C \u0645\u0645\u0627\u0631\u0633\u0629 \u0645\u0633\u062A\u0642\u0644\u0629]\u060C \u0646\u0634\u0627\u0637 \u0627\u0644\u0643\u062A\u0627\u0628\u0629 [\u0646\u0645\u0630\u062C\u0629\u060C \u0645\u0645\u0627\u0631\u0633\u0629 \u0645\u0648\u062C\u0647\u0629\u060C \u0645\u0645\u0627\u0631\u0633\u0629 \u0645\u0633\u062A\u0642\u0644\u0629]\u060C \u0648\u0627\u062E\u062A\u062A\u0627\u0645).
   - "\u0627\u0644\u062E\u0637\u0627\u0637\u0629 \u0627\u0644\u0630\u0647\u0646\u064A\u0629 \u0644\u062F\u0631\u0633 \u0627\u0644\u0631\u064A\u0627\u0636\u064A\u0627\u062A" (\u0648\u0641\u0642 \u0646\u0645\u0648\u0630\u062C \u0627\u0644\u062A\u062F\u0631\u064A\u0633 \u0627\u0644\u0635\u0631\u064A\u062D: \u0627\u0641\u062A\u062A\u0627\u062D\u060C \u0646\u0634\u0627\u0637 \u0627\u0644\u0639\u062F [\u0646\u0645\u0630\u062C\u0629\u060C \u0645\u0645\u0627\u0631\u0633\u0629 \u0645\u0648\u062C\u0647\u0629\u060C \u0645\u0645\u0627\u0631\u0633\u0629 \u0645\u0633\u062A\u0642\u0644\u0629]\u060C \u0646\u0634\u0627\u0637 \u0627\u0644\u062D\u0633\u0627\u0628 [\u0646\u0645\u0630\u062C\u0629\u060C \u0645\u0645\u0627\u0631\u0633\u0629 \u0645\u0648\u062C\u0647\u0629\u060C \u0645\u0645\u0627\u0631\u0633\u0629 \u0645\u0633\u062A\u0642\u0644\u0629]\u060C \u0646\u0634\u0627\u0637 \u062D\u0644 \u0627\u0644\u0645\u0633\u0627\u0626\u0644 [\u0646\u0645\u0630\u062C\u0629\u060C \u0645\u0645\u0627\u0631\u0633\u0629 \u0645\u0648\u062C\u0647\u0629\u060C \u0645\u0645\u0627\u0631\u0633\u0629 \u0645\u0633\u062A\u0642\u0644\u0629]\u060C \u0648\u0627\u062E\u062A\u062A\u0627\u0645).
   - "\u0627\u0644\u062E\u0637\u0627\u0637\u0629 \u0627\u0644\u0630\u0647\u0646\u064A\u0629 \u0644\u062F\u0631\u0633 \u0627\u0644\u0641\u0631\u0646\u0633\u064A\u0629" (\u0648\u0641\u0642 \u0646\u0645\u0648\u0630\u062C \u0627\u0644\u062A\u062F\u0631\u064A\u0633 \u0627\u0644\u0635\u0631\u064A\u062D \u0628\u0627\u0644\u0641\u0631\u0646\u0633\u064A\u0629: Ouverture, Activit\xE9s Principales [Lecture, \xC9criture], Cl\xF4ture).
5. \u0625\u0639\u062F\u0627\u062F "\u0627\u0644\u0645\u0630\u0643\u0631\u0629 \u0627\u0644\u064A\u0648\u0645\u064A\u0629 (Cahier Journal)" \u0627\u0644\u0645\u0648\u062D\u062F\u0629 \u0644\u0644\u064A\u0648\u0645 \u0643\u0627\u0645\u0644\u0627\u064B\u060C \u0645\u0639 \u0623\u062E\u0630 \u0645\u0643\u0648\u0646\u0627\u062A \u0648\u0645\u0648\u0627\u062F \u0630\u0644\u0643 \u0627\u0644\u064A\u0648\u0645 \u0641\u064A \u062C\u062F\u0648\u0644 \u0627\u0633\u062A\u0639\u0645\u0627\u0644 \u0627\u0644\u0632\u0645\u0646 \u0627\u0644\u0630\u064A \u0623\u0646\u0634\u0623\u0647 \u0627\u0644\u0623\u0633\u062A\u0627\u0630 \u0628\u0639\u064A\u0646 \u0627\u0644\u0627\u0639\u062A\u0628\u0627\u0631 \u0625\u0646 \u0648\u062C\u062F\u060C \u0648\u062A\u0646\u0638\u064A\u0645 \u0627\u0644\u062D\u0635\u0635 \u0642\u0628\u0644 \u0627\u0644\u0627\u0633\u062A\u0631\u0627\u062D\u0629 (preBreakSessions) \u0648\u0628\u0639\u062F \u0627\u0644\u0627\u0633\u062A\u0631\u0627\u062D\u0629 (postBreakSessions).

\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0623\u0633\u062A\u0627\u0630 \u0648\u0627\u0644\u0633\u064A\u0627\u0642:
- \u0627\u0644\u0645\u0631\u062D\u0644\u0629: ${cleanPhase === "intensive_remediation" ? "\u0641\u062A\u0631\u0629 \u0627\u0644\u062F\u0639\u0645 \u0627\u0644\u0645\u0643\u062B\u0641 \u0644\u062A\u0639\u0644\u0645\u0627\u062A \u0627\u0644\u0623\u0633\u0627\u0633 (TaRL)" : "\u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u062A\u062F\u0631\u064A\u0633 \u0627\u0644\u0635\u0631\u064A\u062D \u0627\u0644\u0645\u0639\u062A\u0627\u062F (\u0625\u0631\u0633\u0627\u0621 \u0627\u0644\u0645\u0648\u0627\u0631\u062F)"}
- \u0627\u0644\u062A\u0627\u0631\u064A\u062E: ${cleanDate} (${cleanDayName})
- \u0627\u0644\u0645\u0633\u062A\u0648\u0649 \u0627\u0644\u062F\u0631\u0627\u0633\u064A: ${cleanProfile.level}
- \u0627\u0644\u0641\u0648\u062C: ${cleanProfile.classGroup}
- \u0635\u064A\u063A\u0629 \u0627\u0644\u0639\u0645\u0644 / \u0646\u0645\u0637 \u0627\u0644\u062A\u062F\u0631\u064A\u0633: ${teachingModeLabels[cleanProfile.teachingMode] || cleanProfile.teachingMode}
- \u0627\u0644\u0623\u0643\u0627\u062F\u064A\u0645\u064A\u0629: ${cleanProfile.academy}
- \u0627\u0644\u0645\u062F\u064A\u0631\u064A\u0629: ${cleanProfile.direction}
- \u0627\u0644\u0645\u0624\u0633\u0633\u0629: ${cleanProfile.school}
- \u0627\u0644\u0623\u0633\u062A\u0627\u0630(\u0629): ${cleanProfile.teacherName}${timetableContext}

\u0645\u0639\u0637\u064A\u0627\u062A \u0627\u0644\u062F\u0631\u0648\u0633 \u0648\u0627\u0644\u0648\u062B\u0627\u0626\u0642 \u0627\u0644\u0645\u062F\u062E\u0644\u0629:
- \u062F\u0631\u0633 \u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629: ${cleanArabicInput || "\u0627\u0633\u062A\u062E\u0644\u0627\u0635 \u0645\u0646 \u0627\u0644\u0648\u062B\u0627\u0626\u0642 \u0627\u0644\u0631\u0642\u0645\u064A\u0629 \u0627\u0644\u0645\u0631\u0641\u0642\u0629 \u0623\u0648 \u0642\u0631\u0627\u0621\u0629 \u0646\u0635 \u0642\u0635\u064A\u0631 \u0648\u062A\u0631\u0643\u064A\u0628 \u062C\u0645\u0644"}
- \u062F\u0631\u0633 \u0627\u0644\u0631\u064A\u0627\u0636\u064A\u0627\u062A: ${cleanMathInput || "\u0627\u0633\u062A\u062E\u0644\u0627\u0635 \u0645\u0646 \u0627\u0644\u0648\u062B\u0627\u0626\u0642 \u0627\u0644\u0631\u0642\u0645\u064A\u0629 \u0627\u0644\u0645\u0631\u0641\u0642\u0629 \u0623\u0648 \u0627\u0644\u0639\u062F \u0648\u0627\u0644\u062D\u0633\u0627\u0628 \u0648\u0627\u0644\u0645\u0633\u0623\u0644\u0629"}
- \u062F\u0631\u0633 \u0627\u0644\u0641\u0631\u0646\u0633\u064A\u0629: ${cleanFrenchInput || "Lecture, \xE9criture et pratique explicite selon les documents"}
- \u062A\u0648\u062C\u064A\u0647\u0627\u062A \u0625\u0636\u0627\u0641\u064A\u0629: ${cleanCustomInstructions || "\u0627\u0644\u062A\u0648\u0627\u0641\u0642 \u0627\u0644\u062A\u0627\u0645 \u0645\u0639 \u0646\u0645\u0630\u062C\u0629 \u0627\u0644\u062A\u062F\u0631\u064A\u0633 \u0627\u0644\u0635\u0631\u064A\u062D \u0644\u0645\u062F\u0627\u0631\u0633 \u0627\u0644\u0631\u064A\u0627\u062F\u0629 \u0627\u0644\u0645\u063A\u0631\u0628\u064A\u0629"}${attachedDocsSection}

\u0642\u0645 \u0628\u062A\u0648\u0644\u064A\u062F JSON \u0645\u0646\u0633\u0642 \u0628\u062F\u0642\u0629 \u0648\u0641\u0642 \u0627\u0644\u0640 Schema \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629 \u0628\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0627\u0644\u0628\u064A\u062F\u0627\u063A\u0648\u062C\u064A\u0629 \u0627\u0644\u0631\u0635\u064A\u0646\u0629 \u0648\u0645\u0635\u0637\u0644\u062D\u0627\u062A \u0627\u0644\u0631\u064A\u0627\u062F\u0629 \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u0629.
`;
    const parts = [];
    if (imagesBase64 && Array.isArray(imagesBase64) && imagesBase64.length > 0) {
      const safeImages = imagesBase64.slice(0, 12);
      for (const img of safeImages) {
        if (img?.data && typeof img.data === "string" && img?.mimeType && typeof img.mimeType === "string") {
          const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];
          if (allowedMimes.includes(img.mimeType)) {
            parts.push({
              inlineData: {
                data: img.data.replace(/^data:[a-zA-Z0-9/+-]+;base64,/, ""),
                mimeType: img.mimeType
              }
            });
          }
        }
      }
    }
    parts.push({ text: promptText });
    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.OBJECT,
          properties: {
            arabicMap: {
              type: import_genai.Type.OBJECT,
              properties: {
                lessonTitle: { type: import_genai.Type.STRING },
                pathway: { type: import_genai.Type.STRING },
                milestone: { type: import_genai.Type.STRING },
                session: { type: import_genai.Type.STRING },
                objectives: {
                  type: import_genai.Type.ARRAY,
                  items: { type: import_genai.Type.STRING }
                },
                opening: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    durationMinutes: { type: import_genai.Type.INTEGER },
                    declareObjective: { type: import_genai.Type.STRING },
                    routineActivity: { type: import_genai.Type.STRING }
                  },
                  required: ["durationMinutes", "declareObjective", "routineActivity"]
                },
                readingActivity: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    durationMinutes: { type: import_genai.Type.INTEGER },
                    modeling: { type: import_genai.Type.STRING },
                    guidedPractice: { type: import_genai.Type.STRING },
                    independentPractice: { type: import_genai.Type.STRING }
                  },
                  required: ["durationMinutes", "modeling", "guidedPractice", "independentPractice"]
                },
                writingActivity: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    durationMinutes: { type: import_genai.Type.INTEGER },
                    modeling: { type: import_genai.Type.STRING },
                    guidedPractice: { type: import_genai.Type.STRING },
                    independentPractice: { type: import_genai.Type.STRING }
                  },
                  required: ["durationMinutes", "modeling", "guidedPractice", "independentPractice"]
                },
                closing: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    durationMinutes: { type: import_genai.Type.INTEGER },
                    game: { type: import_genai.Type.STRING },
                    reflection: { type: import_genai.Type.STRING },
                    homework: { type: import_genai.Type.STRING }
                  },
                  required: ["durationMinutes", "game", "reflection", "homework"]
                }
              },
              required: ["lessonTitle", "pathway", "milestone", "session", "objectives", "opening", "readingActivity", "writingActivity", "closing"]
            },
            mathMap: {
              type: import_genai.Type.OBJECT,
              properties: {
                lessonTitle: { type: import_genai.Type.STRING },
                pathway: { type: import_genai.Type.STRING },
                milestone: { type: import_genai.Type.STRING },
                session: { type: import_genai.Type.STRING },
                objectives: {
                  type: import_genai.Type.ARRAY,
                  items: { type: import_genai.Type.STRING }
                },
                opening: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    durationMinutes: { type: import_genai.Type.INTEGER },
                    declareObjective: { type: import_genai.Type.STRING },
                    routineActivity: { type: import_genai.Type.STRING }
                  },
                  required: ["durationMinutes", "declareObjective", "routineActivity"]
                },
                countingActivity: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    durationMinutes: { type: import_genai.Type.INTEGER },
                    title: { type: import_genai.Type.STRING },
                    modeling: { type: import_genai.Type.STRING },
                    guidedPractice: { type: import_genai.Type.STRING },
                    independentPractice: { type: import_genai.Type.STRING }
                  },
                  required: ["durationMinutes", "title", "modeling", "guidedPractice", "independentPractice"]
                },
                calculationActivity: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    durationMinutes: { type: import_genai.Type.INTEGER },
                    title: { type: import_genai.Type.STRING },
                    modeling: { type: import_genai.Type.STRING },
                    guidedPractice: { type: import_genai.Type.STRING },
                    independentPractice: { type: import_genai.Type.STRING }
                  },
                  required: ["durationMinutes", "title", "modeling", "guidedPractice", "independentPractice"]
                },
                problemSolvingActivity: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    durationMinutes: { type: import_genai.Type.INTEGER },
                    title: { type: import_genai.Type.STRING },
                    modeling: { type: import_genai.Type.STRING },
                    guidedPractice: { type: import_genai.Type.STRING },
                    independentPractice: { type: import_genai.Type.STRING }
                  },
                  required: ["durationMinutes", "title", "modeling", "guidedPractice", "independentPractice"]
                },
                closing: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    durationMinutes: { type: import_genai.Type.INTEGER },
                    game: { type: import_genai.Type.STRING },
                    reflection: { type: import_genai.Type.STRING },
                    homework: { type: import_genai.Type.STRING }
                  },
                  required: ["durationMinutes", "game", "reflection", "homework"]
                }
              },
              required: ["lessonTitle", "pathway", "milestone", "session", "objectives", "opening", "countingActivity", "calculationActivity", "problemSolvingActivity", "closing"]
            },
            frenchMap: {
              type: import_genai.Type.OBJECT,
              properties: {
                lessonTitle: { type: import_genai.Type.STRING },
                pathway: { type: import_genai.Type.STRING },
                milestone: { type: import_genai.Type.STRING },
                session: { type: import_genai.Type.STRING },
                objectives: {
                  type: import_genai.Type.ARRAY,
                  items: { type: import_genai.Type.STRING }
                },
                opening: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    durationMinutes: { type: import_genai.Type.INTEGER },
                    declareObjective: { type: import_genai.Type.STRING },
                    routineActivity: { type: import_genai.Type.STRING }
                  },
                  required: ["durationMinutes", "declareObjective", "routineActivity"]
                },
                readingActivity: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    durationMinutes: { type: import_genai.Type.INTEGER },
                    modeling: { type: import_genai.Type.STRING },
                    guidedPractice: { type: import_genai.Type.STRING },
                    independentPractice: { type: import_genai.Type.STRING }
                  },
                  required: ["durationMinutes", "modeling", "guidedPractice", "independentPractice"]
                },
                writingActivity: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    durationMinutes: { type: import_genai.Type.INTEGER },
                    modeling: { type: import_genai.Type.STRING },
                    guidedPractice: { type: import_genai.Type.STRING },
                    independentPractice: { type: import_genai.Type.STRING }
                  },
                  required: ["durationMinutes", "modeling", "guidedPractice", "independentPractice"]
                },
                closing: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    durationMinutes: { type: import_genai.Type.INTEGER },
                    game: { type: import_genai.Type.STRING },
                    reflection: { type: import_genai.Type.STRING },
                    homework: { type: import_genai.Type.STRING }
                  },
                  required: ["durationMinutes", "game", "reflection", "homework"]
                }
              },
              required: ["lessonTitle", "pathway", "milestone", "session", "objectives", "opening", "readingActivity", "writingActivity", "closing"]
            },
            dailyJournal: {
              type: import_genai.Type.OBJECT,
              properties: {
                date: { type: import_genai.Type.STRING },
                dayName: { type: import_genai.Type.STRING },
                phase: { type: import_genai.Type.STRING },
                pathway: { type: import_genai.Type.STRING },
                milestone: { type: import_genai.Type.STRING },
                preBreakSessions: {
                  type: import_genai.Type.ARRAY,
                  items: {
                    type: import_genai.Type.OBJECT,
                    properties: {
                      id: { type: import_genai.Type.STRING },
                      timing: { type: import_genai.Type.STRING },
                      className: { type: import_genai.Type.STRING },
                      subject: { type: import_genai.Type.STRING },
                      opening: { type: import_genai.Type.STRING },
                      mainContent1Title: { type: import_genai.Type.STRING },
                      mainContent1Desc: { type: import_genai.Type.STRING },
                      mainContent2Title: { type: import_genai.Type.STRING },
                      mainContent2Desc: { type: import_genai.Type.STRING },
                      mainContent3Title: { type: import_genai.Type.STRING },
                      mainContent3Desc: { type: import_genai.Type.STRING },
                      closing: { type: import_genai.Type.STRING },
                      sessionOrder: { type: import_genai.Type.STRING },
                      mindMapRef: { type: import_genai.Type.STRING }
                    },
                    required: ["id", "timing", "className", "subject", "opening", "mainContent1Title", "mainContent1Desc", "mainContent2Title", "mainContent2Desc", "closing", "sessionOrder", "mindMapRef"]
                  }
                },
                breakTitle: { type: import_genai.Type.STRING },
                postBreakSessions: {
                  type: import_genai.Type.ARRAY,
                  items: {
                    type: import_genai.Type.OBJECT,
                    properties: {
                      id: { type: import_genai.Type.STRING },
                      timing: { type: import_genai.Type.STRING },
                      className: { type: import_genai.Type.STRING },
                      subject: { type: import_genai.Type.STRING },
                      opening: { type: import_genai.Type.STRING },
                      mainContent1Title: { type: import_genai.Type.STRING },
                      mainContent1Desc: { type: import_genai.Type.STRING },
                      mainContent2Title: { type: import_genai.Type.STRING },
                      mainContent2Desc: { type: import_genai.Type.STRING },
                      mainContent3Title: { type: import_genai.Type.STRING },
                      mainContent3Desc: { type: import_genai.Type.STRING },
                      closing: { type: import_genai.Type.STRING },
                      sessionOrder: { type: import_genai.Type.STRING },
                      mindMapRef: { type: import_genai.Type.STRING }
                    },
                    required: ["id", "timing", "className", "subject", "opening", "mainContent1Title", "mainContent1Desc", "mainContent2Title", "mainContent2Desc", "closing", "sessionOrder", "mindMapRef"]
                  }
                },
                notes: { type: import_genai.Type.STRING }
              },
              required: ["date", "dayName", "phase", "pathway", "milestone", "preBreakSessions", "breakTitle", "postBreakSessions", "notes"]
            }
          },
          required: ["arabicMap", "mathMap", "frenchMap", "dailyJournal"]
        }
      }
    });
    const parsed = JSON.parse(response.text || "{}");
    res.json({ success: true, data: parsed });
  } catch (error) {
    console.error("Pedagogical generation error:", error);
    res.status(500).json({
      success: false,
      error: error?.message || "\u0641\u0634\u0644 \u0641\u064A \u0645\u0639\u0627\u0644\u062C\u0629 \u0627\u0644\u062F\u0631\u0648\u0633 \u0648\u062A\u0648\u0644\u064A\u062F \u0627\u0644\u062E\u0637\u0627\u0637\u0627\u062A \u0648\u0627\u0644\u0645\u0630\u0643\u0631\u0629 \u0627\u0644\u064A\u0648\u0645\u064A\u0629."
    });
  }
});
app.post("/api/ai/extract-timetable-image", rateLimiter, async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;
    if (!imageBase64 || typeof imageBase64 !== "string") {
      res.status(400).json({ success: false, error: "\u064A\u0631\u062C\u0649 \u062A\u0632\u0648\u064A\u062F \u0635\u0648\u0631\u0629 \u0635\u0627\u0644\u062D\u0629 \u0644\u0627\u0633\u062A\u0639\u0645\u0627\u0644 \u0627\u0644\u0632\u0645\u0646." });
      return;
    }
    const cleanMime = typeof mimeType === "string" && ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(mimeType) ? mimeType : "image/jpeg";
    const cleanData = imageBase64.replace(/^data:[a-zA-Z0-9/+-]+;base64,/, "");
    const ai = getGeminiClient();
    const promptText = `
\u0623\u0646\u062A \u062E\u0628\u064A\u0631 \u0641\u064A \u0627\u0644\u062A\u0639\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0648\u062B\u0627\u0626\u0642 \u0627\u0644\u0645\u062F\u0631\u0633\u064A\u0629 \u0648\u0627\u0633\u062A\u0639\u0645\u0627\u0644\u0627\u062A \u0627\u0644\u0632\u0645\u0646 (Emploi du temps) \u0627\u0644\u062E\u0627\u0635\u0629 \u0628\u0627\u0644\u062A\u0639\u0644\u064A\u0645 \u0627\u0644\u0627\u0628\u062A\u062F\u0627\u0626\u064A \u0641\u064A \u0627\u0644\u0645\u063A\u0631\u0628 \u0648\u062E\u0627\u0635\u0629 \u0645\u062F\u0627\u0631\u0633 \u0627\u0644\u0631\u064A\u0627\u062F\u0629 (\xC9coles Pionni\xE8res).

\u0627\u0644\u0645\u0637\u0644\u0648\u0628:
\u062A\u062D\u0644\u064A\u0644 \u0635\u0648\u0631\u0629 \u0627\u0633\u062A\u0639\u0645\u0627\u0644 \u0627\u0644\u0632\u0645\u0646 \u0627\u0644\u0645\u0631\u0641\u0642\u0629 \u0648\u0627\u0633\u062A\u062E\u0631\u0627\u062C \u062C\u0645\u064A\u0639 \u0627\u0644\u062D\u0635\u0635 \u0648\u0627\u0644\u0645\u0648\u0627\u0642\u064A\u062A \u0628\u062F\u0642\u0629 \u0644\u0645\u0644\u0621 \u062C\u062F\u0648\u0644 \u0627\u0633\u062A\u0639\u0645\u0627\u0644 \u0627\u0644\u0632\u0645\u0646 \u0627\u0644\u0631\u0642\u0645\u064A.
1. \u0627\u0633\u062A\u062E\u0631\u0627\u062C \u0645\u0648\u0627\u0642\u064A\u062A \u0627\u0644\u0641\u062A\u0631\u0627\u062A (\u0627\u0644\u0641\u062A\u0631\u0629 \u0627\u0644\u0635\u0628\u0627\u062D\u064A\u0629 \u0627\u0644\u0634\u0637\u0631 1 \u0648 2\u060C \u0648\u0627\u0644\u0641\u062A\u0631\u0629 \u0627\u0644\u0645\u0633\u0627\u0626\u064A\u0629 \u0627\u0644\u0634\u0637\u0631 1 \u0648 2).
2. \u0627\u0633\u062A\u062E\u0631\u0627\u062C \u0627\u0644\u062D\u0635\u0635 \u0644\u0643\u0644 \u064A\u0648\u0645 \u0645\u0646 \u0623\u064A\u0627\u0645 \u0627\u0644\u0623\u0633\u0628\u0648\u0639 (\u0627\u0644\u0625\u062B\u0646\u064A\u0646\u060C \u0627\u0644\u062B\u0644\u0627\u062B\u0627\u0621\u060C \u0627\u0644\u0623\u0631\u0628\u0639\u0627\u0621\u060C \u0627\u0644\u062E\u0645\u064A\u0633\u060C \u0627\u0644\u062C\u0645\u0639\u0629\u060C \u0627\u0644\u0633\u0628\u062A).
3. \u062A\u062D\u062F\u064A\u062F \u0627\u0644\u0645\u0627\u062F\u0629 (\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629\u060C \u0627\u0644\u0631\u064A\u0627\u0636\u064A\u0627\u062A\u060C Fran\xE7ais\u060C \u0627\u0644\u0646\u0634\u0627\u0637 \u0627\u0644\u0639\u0644\u0645\u064A\u060C \u0627\u0644\u062A\u0631\u0628\u064A\u0629 \u0627\u0644\u0625\u0633\u0644\u0627\u0645\u064A\u0629\u060C \u0627\u0644\u062A\u0631\u0628\u064A\u0629 \u0627\u0644\u0641\u0646\u064A\u0629\u060C \u0627\u0644\u062A\u0631\u0628\u064A\u0629 \u0627\u0644\u0628\u062F\u0646\u064A\u0629\u060C \u0627\u0644\u0623\u0645\u0627\u0632\u064A\u063A\u064A\u0629\u060C \u0627\u0644\u062F\u0639\u0645 \u0637\u0627\u0631\u0644\u060C \u0625\u0644\u062E).
4. \u062A\u062D\u062F\u064A\u062F \u0627\u0644\u0641\u0648\u062C (\u0641\u0648\u062C 1\u060C \u0641\u0648\u062C 2) \u0623\u0648 \u0627\u0644\u0642\u0633\u0645 \u0625\u0630\u0627 \u0643\u0627\u0646 \u0645\u0630\u0643\u0648\u0631\u0627\u064B.
5. \u062A\u0648\u0642\u064A\u062A \u0628\u062F\u0627\u064A\u0629 \u0648\u0646\u0647\u0627\u064A\u0629 \u0643\u0644 \u062D\u0635\u0629 \u0628\u062F\u0642\u0629 \u0628\u0635\u064A\u063A\u0629 HH:mm (\u0645\u062B\u0644\u0627\u064B 08:00 \u0625\u0644\u0649 09:00).
6. \u0627\u0633\u0645 \u0627\u0644\u0623\u0633\u062A\u0627\u0630 \u0648\u0627\u0644\u0645\u0633\u062A\u0648\u0649 \u0648\u0627\u0644\u0645\u0624\u0633\u0633\u0629 \u0625\u0630\u0627 \u0643\u0627\u0646\u062A \u0648\u0627\u0636\u062D\u0629.

\u0642\u0645 \u0628\u062A\u0648\u0644\u064A\u062F JSON \u0645\u0646\u0633\u0642 \u0628\u062F\u0642\u0629 \u0648\u0641\u0642 \u0627\u0644\u0640 Schema.
`;
    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanData,
              mimeType: cleanMime
            }
          },
          { text: promptText }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.OBJECT,
          properties: {
            detectedTeacherName: { type: import_genai.Type.STRING },
            detectedLevel: { type: import_genai.Type.STRING },
            detectedSchool: { type: import_genai.Type.STRING },
            detectedAcademicYear: { type: import_genai.Type.STRING },
            timingConfig: {
              type: import_genai.Type.OBJECT,
              properties: {
                morning1Start: { type: import_genai.Type.STRING },
                morning1End: { type: import_genai.Type.STRING },
                morning2Start: { type: import_genai.Type.STRING },
                morning2End: { type: import_genai.Type.STRING },
                afternoon1Start: { type: import_genai.Type.STRING },
                afternoon1End: { type: import_genai.Type.STRING },
                afternoon2Start: { type: import_genai.Type.STRING },
                afternoon2End: { type: import_genai.Type.STRING }
              }
            },
            slots: {
              type: import_genai.Type.ARRAY,
              items: {
                type: import_genai.Type.OBJECT,
                properties: {
                  day: { type: import_genai.Type.STRING },
                  startTime: { type: import_genai.Type.STRING },
                  endTime: { type: import_genai.Type.STRING },
                  subject: { type: import_genai.Type.STRING },
                  group: { type: import_genai.Type.STRING },
                  notes: { type: import_genai.Type.STRING }
                },
                required: ["day", "startTime", "endTime", "subject"]
              }
            }
          },
          required: ["slots"]
        }
      }
    });
    const parsed = JSON.parse(response.text || "{}");
    res.json({ success: true, data: parsed });
  } catch (error) {
    console.error("Timetable image extraction error:", error);
    res.status(500).json({
      success: false,
      error: error?.message || "\u062A\u0639\u0630\u0631 \u0627\u0633\u062A\u062E\u0631\u0627\u062C \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0633\u062A\u0639\u0645\u0627\u0644 \u0627\u0644\u0632\u0645\u0646 \u0645\u0646 \u0627\u0644\u0635\u0648\u0631\u0629. \u064A\u0631\u062C\u0649 \u0627\u0644\u062A\u0623\u0643\u062F \u0645\u0646 \u0648\u0636\u0648\u062D \u0627\u0644\u0635\u0648\u0631\u0629 \u0648\u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0645\u062C\u062F\u062F\u0627\u064B."
    });
  }
});
app.post("/api/ai/extract-tarl-grid", rateLimiter, async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;
    if (!imageBase64 || typeof imageBase64 !== "string") {
      res.status(400).json({ success: false, error: "\u064A\u0631\u062C\u0649 \u062A\u0632\u0648\u064A\u062F \u0635\u0648\u0631\u0629 \u0648\u0627\u0636\u062D\u0629 \u0644\u0634\u0628\u0643\u0629 \u062A\u0641\u0631\u064A\u063A \u0631\u0648\u0627\u0626\u0632 \u0627\u0644\u0645\u0648\u0636\u0639\u0629." });
      return;
    }
    const cleanMime = typeof mimeType === "string" && ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(mimeType) ? mimeType : "image/jpeg";
    const cleanData = imageBase64.replace(/^data:[a-zA-Z0-9/+-]+;base64,/, "");
    const ai = getGeminiClient();
    const promptText = `
\u0623\u0646\u062A \u062E\u0628\u064A\u0631 \u0628\u064A\u062F\u0627\u063A\u0648\u062C\u064A \u0645\u062A\u062E\u0635\u0635 \u0641\u064A \u0645\u0642\u0627\u0631\u0628\u0629 \u0637\u0627\u0631\u0644 (TaRL) \u0648\u0645\u062F\u0627\u0631\u0633 \u0627\u0644\u0631\u064A\u0627\u062F\u0629 \u0641\u064A \u0627\u0644\u0645\u063A\u0631\u0628.
\u0627\u0644\u0645\u0637\u0644\u0648\u0628: \u062A\u062D\u0644\u064A\u0644 \u0635\u0648\u0631\u0629 \u0634\u0628\u0643\u0629 \u062A\u0641\u0631\u064A\u063A \u0646\u062A\u0627\u0626\u062C \u0631\u0627\u0626\u0632 \u0627\u0644\u0645\u0648\u0636\u0639\u0629 \u0648\u0627\u0633\u062A\u062E\u0631\u0627\u062C \u0627\u0644\u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A \u0627\u0644\u062F\u0642\u064A\u0642\u0629 \u0627\u0644\u062E\u0627\u0635\u0629 \u0628\u0623\u0639\u062F\u0627\u062F \u0627\u0644\u062A\u0644\u0627\u0645\u064A\u0630 \u0641\u064A \u0643\u0644 \u0645\u0633\u062A\u0648\u0649 \u0644\u0645\u0648\u0627\u062F:
1. \u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 (\u0645\u0633\u062A\u0648\u0649 \u0627\u0644\u062D\u0631\u0641\u060C \u0627\u0644\u0643\u0644\u0645\u0629\u060C \u0627\u0644\u0641\u0642\u0631\u0629\u060C \u0627\u0644\u0642\u0635\u0629\u060C \u0627\u0644\u0641\u0647\u0645).
2. \u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0641\u0631\u0646\u0633\u064A\u0629 (Lettre, Mot, Paragraphe, Histoire, Compr\xE9hension).
3. \u0627\u0644\u0631\u064A\u0627\u0636\u064A\u0627\u062A (\u0645\u0628\u062A\u062F\u0626 / \u0639\u062F\u060C \u062C\u0645\u0639\u060C \u0637\u0631\u062D\u060C \u0636\u0631\u0628\u060C \u0642\u0633\u0645\u0629\u060C \u0645\u0633\u0623\u0644\u0629).
4. \u0625\u062C\u0645\u0627\u0644\u064A \u0639\u062F\u062F \u0627\u0644\u062A\u0644\u0627\u0645\u064A\u0630 \u0627\u0644\u0645\u0633\u062C\u0644\u064A\u0646\u060C \u0627\u0644\u062D\u0627\u0636\u0631\u064A\u0646\u060C \u0627\u0644\u0645\u062A\u063A\u064A\u0628\u064A\u0646.
5. \u0627\u0633\u0645 \u0627\u0644\u0645\u0624\u0633\u0633\u0629\u060C \u0627\u0644\u0645\u0633\u062A\u0648\u0649\u060C \u0627\u0644\u0641\u0648\u062C\u060C \u0648\u0627\u0633\u0645 \u0627\u0644\u0623\u0633\u062A\u0627\u0630(\u0629) \u0625\u0630\u0627 \u0643\u0627\u0646\u062A \u0645\u0643\u062A\u0648\u0628\u0629 \u0628\u0627\u0644\u0648\u0631\u0642\u0629.

\u0642\u0645 \u0628\u062D\u0633\u0627\u0628 \u0627\u0644\u0623\u0639\u062F\u0627\u062F \u0628\u062F\u0642\u0629 \u0648\u062A\u0648\u0644\u064A\u062F JSON \u0645\u0646\u0633\u0642 \u0648\u0641\u0642 \u0627\u0644\u0640 Schema.
`;
    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanData,
              mimeType: cleanMime
            }
          },
          { text: promptText }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.OBJECT,
          properties: {
            detectedSchool: { type: import_genai.Type.STRING },
            detectedLevel: { type: import_genai.Type.STRING },
            detectedClassGroup: { type: import_genai.Type.STRING },
            detectedTeacherName: { type: import_genai.Type.STRING },
            totalEnrolled: { type: import_genai.Type.INTEGER },
            totalPresent: { type: import_genai.Type.INTEGER },
            totalAbsent: { type: import_genai.Type.INTEGER },
            arabicStats: {
              type: import_genai.Type.OBJECT,
              properties: {
                letter: { type: import_genai.Type.INTEGER },
                word: { type: import_genai.Type.INTEGER },
                paragraph: { type: import_genai.Type.INTEGER },
                story: { type: import_genai.Type.INTEGER },
                comprehension: { type: import_genai.Type.INTEGER }
              }
            },
            frenchStats: {
              type: import_genai.Type.OBJECT,
              properties: {
                letter: { type: import_genai.Type.INTEGER },
                word: { type: import_genai.Type.INTEGER },
                paragraph: { type: import_genai.Type.INTEGER },
                story: { type: import_genai.Type.INTEGER },
                comprehension: { type: import_genai.Type.INTEGER }
              }
            },
            mathStats: {
              type: import_genai.Type.OBJECT,
              properties: {
                beginner: { type: import_genai.Type.INTEGER },
                addition: { type: import_genai.Type.INTEGER },
                subtraction: { type: import_genai.Type.INTEGER },
                multiplication: { type: import_genai.Type.INTEGER },
                division: { type: import_genai.Type.INTEGER },
                problem: { type: import_genai.Type.INTEGER }
              }
            },
            generalNotes: { type: import_genai.Type.STRING }
          }
        }
      }
    });
    const parsed = JSON.parse(response.text || "{}");
    res.json({ success: true, data: parsed });
  } catch (error) {
    console.error("TaRL grid image extraction error:", error);
    res.status(500).json({
      success: false,
      error: error?.message || "\u062A\u0639\u0630\u0631 \u0627\u0633\u062A\u062E\u0631\u0627\u062C \u0628\u064A\u0627\u0646\u0627\u062A \u0634\u0628\u0643\u0629 \u0637\u0627\u0631\u0644 \u0645\u0646 \u0627\u0644\u0635\u0648\u0631\u0629. \u064A\u0645\u0643\u0646\u0643 \u0625\u062F\u062E\u0627\u0644 \u0627\u0644\u0623\u0631\u0642\u0627\u0645 \u0648\u0627\u0644\u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A \u064A\u062F\u0648\u064A\u0627\u064B \u0628\u0633\u0647\u0648\u0644\u0629."
    });
  }
});
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Rayed Server running on http://0.0.0.0:${PORT}`);
  });
}
start();
//# sourceMappingURL=server.cjs.map
