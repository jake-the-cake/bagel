import { core } from "../../core/index.js";

const address = core.newModel("address");

address.id();
address.field("street1", { required: true });
address.field("street2");
address.field("city");
address.field("state");
address.field("zip", { required: true, type: "integer" });
address.field("active", { default: true, type: "boolean" });
address.timestamps();

export { address };
