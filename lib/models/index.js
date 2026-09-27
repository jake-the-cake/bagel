import { errorUtil } from "../util/index.js";
import { users } from "./users.js";

const DUP_MODEL = errorUtil.createError(500, "Duplicate model names found.");
const NO_MODEL = errorUtil.createError(500, "Model does not exist.");

const models = [users];

function useModel(name) {
  const filtered = models.filter((model) => model.name === name);
  if (filtered.length > 1) throw DUP_MODEL;
  if (!filtered.length) throw NO_MODEL;
  return filtered[0].clone();
}

export { models, useModel };
