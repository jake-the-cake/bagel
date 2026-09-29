import { core } from "../../core/index.js";

const companyUsers = core.newModel("company_users");

companyUsers.id();
companyUsers.field("user_id", { required: true, reference: "users" });
companyUsers.field("company_id", { required: true, reference: "companies" });
companyUsers.field("role", { default: "user" });
companyUsers.field("active", { default: true, type: "boolean" });
companyUsers.timestamps();

export { companyUsers };
