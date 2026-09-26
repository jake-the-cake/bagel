import { useBaseClass } from "../core/base.js";

class Schema extends useBaseClass() {
  constructor(context) {
    super(context, initSchema);
  }

  init() {
    this.model = null;
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
