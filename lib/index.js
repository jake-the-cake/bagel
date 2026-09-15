import Express from "express";
import cors from "cors";
import ejsMate from "ejs-mate";
import route from "./route/index.js";
import { middleware } from "./handle/index.js";
import { useEnv } from "./util/env.js";
import { connectDb, disconnectDb } from "./data/db.js";

/** Create the application */
const app = Express();
const PORT = useEnv("PORT", 3000);

/** View engine setup */
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", "views");

/** Middleware */
app.use(cors());
app.use(Express.json());
app.use(Express.urlencoded({ extended: true }));
app.use("/static", Express.static("public"));
app.use(middleware.reqMiddleware);

/** 405 Handler */
app.use(middleware.errorMiddleware405);

/** API Routes */
app.use(useEnv("API_PATH", "/api"), route.apiRouter);

/** Web/App Routes */
app.use("/", route.webRouter);
app.use(useEnv("APP_PATH", "/app"), route.appRouter);

/** 404 handler */
app.use(middleware.errorMiddleware404);

/** Start the server */
app.listen(PORT, async () => {
  console.log(`Server running @ :${PORT}`);
  try {
    await connectDb();
  } catch (err) {
    console.error("Failed to connect to database:", err.message);
  }
});

/** Graceful shutdown */
process.on("SIGINT", async () => {
  console.log("\nShutting down gracefully...");
  await disconnectDb();
  process.exit(0);
});
