import { core } from "../../core/index.js";

const companies = core.newModel("companies");

companies.id();
companies.field("name", { required: true });
companies.field("active", { default: true, type: "boolean" });
companies.timestamps();

export { companies };
