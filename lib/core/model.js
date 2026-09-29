class Model {
  constructor(name) {
    this.name = name;
    this.fields = {};
  }

  // FIELDS

  field(name, options = {}) {
    this.fields[name] = {
      type: "string",
      required: false,
      unique: false,
      min: null,
      max: 255,
      primary: false,
      generated: false,
      default: null,
      value: undefined,
      ...options,
    };
    return this;
  }

  id(name = "id") {
    return this.field(name, {
      type: "id",
      primary: true,
      generated: true,
    });
  }

  active() {
    return this.field("active", this.defaultBoolean());
  }

  created() {
    this.field("created_at", this.deafultTimestamp());
    return this;
  }

  timestamps() {
    this.created();
    this.field("updated_at", this.deafultTimestamp());
    return this;
  }

  // DEFAULT OBJECTS

  deafultTimestamp() {
    return {
      type: "date",
      generated: true,
      default: "CURRENT_TIMESTAMP",
    };
  }

  defaultBoolean() {
    return {
      type: "boolean",
      required: true,
      default: true,
    };
  }

  // VALUES

  setValues(data = {}) {
    Object.entries(data).forEach(([key, value]) => {
      if (this.fields[key]) this.fields[key].value = value;
    });
    return this;
  }

  clearValues() {
    Object.values(this.fields).forEach((field) => {
      field.value = undefined;
    });
    return this;
  }

  // DATA

  data() {
    const data = {};
    Object.entries(this.fields).forEach(([name, field]) => {
      if (field.value !== undefined) data[name] = field.value;
    });
    return data;
  }

  // SCHEMA

  hasField(name) {
    return Object.hasOwn(this.fields, name);
  }

  getField(name) {
    return this.fields[name] ?? null;
  }

  entries() {
    return Object.entries(this.fields);
  }

  clone() {
    const model = new Model(this.name);
    model.fields = structuredClone(this.fields);
    return model;
  }
}

function newModel(name) {
  return new Model(name);
}

export { newModel };
