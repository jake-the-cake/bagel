import Express from "express";
import { errorUtil } from "../util/index.js";

const webRouter = Express.Router();

webRouter.get("/", (req, res) => {
  res.output.res.html("index", { layoutName: "web", title: "Website name" });
});

webRouter.get("/error/:status", (req, res) => {
  res.output.res.error(errorUtil.defaultError(req.params.status));
});

webRouter.get("/about", (req, res) => {
  res.output.res.html("about", { layoutName: "web", title: "About Page" });
});

export default webRouter;
