import { core } from "../../core/index.js";

const historyAddress = core.newModel("history-address");

historyAddress.field("reference_id", {
  required: true,
  references: ["users", "companies"],
});
historyAddress.field("previous_id", {
  required: true,
  type: "integer",
  reference: "address",
});
historyAddress.field("next_id", {
  required: true,
  type: "integer",
  reference: "address",
});
historyAddress.field("comment");
historyAddress.created();

export { historyAddress };
