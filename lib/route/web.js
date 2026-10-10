import Express from "express";
import { errorUtil } from "../util/index.js";

const webRouter = Express.Router();

webRouter.get("/", (req, res) => {
  res.Html("index", { title: "Home" });
});

webRouter.get("/login", (req, res) => {
  res.Html("login", { title: "Login" });
});

webRouter.get("/error/:status", (req, res) => {
  res.Html("error", { error: errorUtil.defaultError(req.params.status) });
});

webRouter.get("/demo", (req, res) => {
  res.Html("demo", { title: "Product Demonstrations" });
});

export default webRouter;
