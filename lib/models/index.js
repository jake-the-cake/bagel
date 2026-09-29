import { errorUtil } from "../util/index.js";

const NO_MODEL = errorUtil.createError(404, "Model does not exist.");
const DUP_MODEL = errorUtil.createError(500, "Duplicate model names found.");

// USER MODELS
import { users } from "./user/users.js";
import { userProfile } from "./user/userProfile.js";
import { companies } from "./user/companies.js";
import { companyUsers } from "./user/companyUsers.js";

const userModels = [users, userProfile, companies, companyUsers];

// CONTACT MODELS
import { address } from "./contact/address.js";
import { phone } from "./contact/phone.js";
import { contactHistory } from "./contact/history.js";

const contactModels = [address, phone, contactHistory];

// =======
// EXPORTS
const models = [...userModels, ...contactModels];

function useModel(name) {
  const filtered = models.filter((model) => model.name === name);
  if (filtered.length > 1) throw DUP_MODEL;
  if (!filtered.length) throw NO_MODEL;
  return filtered[0].clone();
}

export { models, useModel };
