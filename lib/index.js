import Express from "express";
import cors from "cors";
import route from "./route/index.js";
import { middleware } from "./handle/index.js";
import { useError } from "./util/err.js";
import { useEnv } from "./util/env.js";
import { connectDb, disconnectDb } from "./data/db.js";

/** Create the application */
const app = Express();
const PORT = useEnv("PORT", 3000);
const API_PATH = "/api";

/** View engine setup */
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
app.use("/app", route.appRouter);

/** 404 handler */
app.use(middleware.errorMiddleware404);

/** Start the server */
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
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
