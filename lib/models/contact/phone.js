import { core } from "../../core/index.js";

const phone = core.newModel("phone");

phone.id();
phone.field("number", { required: true, type: "integer" });
phone.field("country", { default: "USA" });
phone.field("active", { default: true, type: "boolean" });
phone.timestamps();

export { phone };
