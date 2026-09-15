import Express from "express";
import { handle } from "../handle/index.js";

const webRouter = Express.Router();

webRouter.get("/", (req, res) => {
  res.out.html("index", { layoutName: "web", title: "Website name" });
});

webRouter.get("/about", (req, res) => {
  res.out.html("about", { layoutName: "web", title: "About Page" });
});

export default webRouter;
