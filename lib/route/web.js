import Express from "express";
import { handle } from "../handle/index.js";

const webRouter = Express.Router();

webRouter.get("/", (req, res) => {
  res.out.html("index");
});

webRouter.get("/about", (req, res) => {
  res.out.html("about");
});

export default webRouter;
