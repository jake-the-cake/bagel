import Express from "express";
import cors from "cors";
import appRouter from "./route/app.js";
import apiRouter from "./route/api.js";
import { reqMiddleware } from "./control/req.js";
import { createError, errHtml, errJson } from "./control/err.js";
import { errRes, newRes } from "./control/res.js";
import webRouter from "./route/web.js";

/** Create the application */
const app = Express();
const PORT = process.env.PORT || 3000;

/** View engine setup */
app.set("view engine", "ejs");
app.set("views", "views");

/** Middleware */
app.use(cors());
app.use(Express.json());
app.use(Express.urlencoded({ extended: true }));
app.use(Express.static("public"));
app.use(reqMiddleware);

/** API Routes */
app.use("/api", apiRouter);

/** 405 Handler */
app.use((req, res, next) => {
  req.method !== "GET" &&
    errRes(req, res, 405, "This application only accepts 'GET' requests.");
  next();
});

/** Web/App Routes */
app.use("/", webRouter);
app.use("/app", appRouter);

/** 404 handler */
app.use((req, res) => {
  errRes(req, res, 404, "There are no files or endpoints found at this URL.");
});

/** Start the server */
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
