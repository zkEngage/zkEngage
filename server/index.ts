import express, { Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import cors from "cors";

dotenv.config();

const app = express();

// --------------------
// 1. Enable CORS for all origins
// --------------------
//app.use(cors({
  //origin: "*",
  //methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  //allowedHeaders: ["Content-Type","Authorization"],
  //credentials: true,
//}));

app.use(cors());

// Handle OPTIONS preflight for all routes
app.options("*", cors());

// --------------------
// 2. Parse JSON and URL-encoded payloads
// --------------------
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// --------------------
// 3. Logging middleware
// --------------------
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson: any, ...args: any[]) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      if (logLine.length > 80) logLine = logLine.slice(0, 79) + "…";
      log(logLine);
    }
  });

  next();
});

// --------------------
// 4. Routes
// --------------------
app.use("/api/auth", authRoutes);

// --------------------
// 5. Register other async routes AFTER CORS and authRoutes
// --------------------
(async () => {
  await registerRoutes(app);

  // --------------------
  // 6. Error handling
  // --------------------
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  // --------------------
  // 7. Remove Vite or static serving (previously section 7)
  // --------------------
  // Commented out to prevent serving frontend
  /*
  if (app.get("env") === "development") {
    await setupVite(app, app);
  } else {
    serveStatic(app);
  }
  */

  // --------------------
  // 8. Start server
  // --------------------
  const port = parseInt(process.env.PORT || "5000", 10);
  app.listen({ port, host: "0.0.0.0", reusePort: true }, () => {
    log(`Server running on port ${port}`);
  });
})();