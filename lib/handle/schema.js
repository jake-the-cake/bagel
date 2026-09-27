import { useBaseClass } from "../core/base.js";
import { useModel } from "../models/index.js";
import { errorUtil } from "../util/index.js";

class Schema extends useBaseClass() {
  constructor(context) {
    super(context, initSchema);
  }

  init() {
    this.model = null;
    this.resOut.Require = (...fields) => this.validateRequiredStrict(...fields);
  }

  use(name) {
    this.model = useModel(name, this.details.body);
    this.model.setValues(this.details.body);
    return this.model.data();
  }

  fieldRequiredError(field) {
    return errorUtil.createError(400, `'${field}' is a required field.`);
  }

  validateRequired(...fields) {
    fields.forEach((field) => {
      !this.details.body[field] && this.flag(this.fieldRequiredError(field));
    });
  }

  validateRequiredStrict(...fields) {
    this.validateRequired(...fields);
    if (!this.ok) this.exit();
  }

  validate(model) {
    const data = this.details.body;
    if (!model || !data) return false;
    const validated = {};
    for (const [field, rules] of Object.entries(model)) {
      const value = data[field];
      if (!this.validateField(field, value, rules)) continue;
      if (value !== undefined) validated[field] = value;
    }
    return validated;
  }

  validateField(field, value, rules) {
    if (rules.required && this.isEmpty(value)) return false;

    if (value === undefined || value === null) return true;

    if (rules.type && typeof value !== rules.type) return false;

    if (rules.min && value.length < rules.min) return false;

    if (rules.max && value.length > rules.max) return false;

    return true;
  }

  isEmpty(value) {
    return value === undefined || value === null || value === "";
  }
}

function initSchema(context) {
  return new Schema(context);
}

export { initSchema };
