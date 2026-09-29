import { core } from "../../core/index.js";

const contactHistory = core.newModel("contact_history");

contactHistory.field("reference_id", {
  required: true,
  references: ["users", "companies"],
});
contactHistory.field("type", { required: true });
contactHistory.field("previous_id", {
  required: true,
  type: "integer",
  reference: "address",
});
contactHistory.field("next_id", {
  required: true,
  type: "integer",
  reference: "address",
});
contactHistory.field("comment");
contactHistory.created();

export { contactHistory };
