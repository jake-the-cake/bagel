import { getDb } from "./config.js";

// SQL HELPERS

function identifier(value) {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(value))
    throw new Error(`Invalid SQL identifier: ${value}`);
  return `"${value}"`;
}

function write(...values) {
  return values.join(" ");
}

function parse(values, fallback = "*") {
  return values?.length ? values.join(", ") : fallback;
}

// DATABASE

class Database {
  SELECT = "SELECT";
  FROM = "FROM";
  LIMIT = "LIMIT";
  WHERE = "WHERE";
  INSERT = "INSERT INTO";
  UPDATE = "UPDATE";
  DELETE = "DELETE FROM";
  SET = "SET";
  VALUES = "VALUES";
  ORDER = "ORDER BY";
  RETURNING = "RETURNING";

  constructor() {
    this.params = {};
    this.keys = [];
    this.bindings = [];
    this.command = this.SELECT;
    this.db = getDb();
  }

  // ACTIONS

  selectFrom(table) {
    this.command = this.SELECT;
    this.params[this.SELECT] = "*";
    this.record(this.FROM, identifier(table));
    return this;
  }

  insertInto(table) {
    this.command = this.INSERT;
    this.params[this.INSERT] = identifier(table);
    return this;
  }

  updateRow(table) {
    this.command = this.UPDATE;
    this.params[this.UPDATE] = identifier(table);
    return this;
  }

  deleteFrom(table) {
    this.command = this.DELETE;
    this.params[this.DELETE] = identifier(table);
    return this;
  }

  // DATA

  values(props) {
    const entries = Object.entries(props);
    if (!entries.length) {
      delete this.params[this.VALUES];
      this.keys = this.keys.filter((key) => key !== this.VALUES);
      this.params[this.INSERT] += " DEFAULT VALUES";
      return this;
    }
    const columns = [];
    const placeholders = [];
    entries.forEach(([key, value]) => {
      columns.push(identifier(key));
      placeholders.push(this.placeholder(value));
    });
    this.params[this.INSERT] += ` (${columns.join(", ")})`;
    this.record(this.VALUES, `(${placeholders.join(", ")})`);
    return this;
  }

  set(props) {
    const fields = [];
    Object.entries(props).forEach(([key, value]) => {
      fields.push(`${identifier(key)} = ${this.placeholder(value)}`);
    });
    this.record(this.SET, parse(fields));
    return this;
  }

  // FILTERS

  columns(...columns) {
    this.params[this.SELECT] = parse(columns.map(identifier));
    return this;
  }

  filter(props) {
    const filters = [];
    Object.entries(props).forEach(([key, value]) => {
      filters.push(`${identifier(key)} = ${this.placeholder(value)}`);
    });
    this.record(this.WHERE, parse(filters));
    return this;
  }

  sort(column, direction = "ASC") {
    direction = direction.toUpperCase();
    if (!["ASC", "DESC"].includes(direction)) direction = "ASC";
    this.record(this.ORDER, `${identifier(column)} ${direction}`);
    return this;
  }

  returning(...columns) {
    const fields = columns.length ? columns.map(identifier) : ["*"];
    this.record(this.RETURNING, parse(fields));
    return this;
  }

  // RESULTS

  async all() {
    return (await this.run()).data;
  }

  async one() {
    this.record(this.LIMIT, 1);
    const result = await this.run();
    return result?.data?.[0] ?? null;
  }

  async many(amount) {
    this.record(this.LIMIT, Number(amount));
    return (await this.run()).data;
  }

  // QUERY

  placeholder(value) {
    this.bindings.push(value);
    return `$${this.bindings.length}`;
  }

  record(key, value) {
    this.params[key] = value;
    if (!this.keys.includes(key)) this.keys.push(key);
    return this;
  }

  commandLine() {
    return write(this.command, this.params[this.command]);
  }

  query() {
    const query = [this.commandLine()];
    this.keys.forEach((key) => {
      query.push(write(key, this.params[key]));
    });
    return write(...query);
  }

  // EXECUTION

  async run() {
    const query = this.query();
    console.log(query);
    const result = await this.db.query(query, this.bindings);
    return {
      data: result.rows,
    };
  }
}

// EXPORTS

function initDatabase(context) {
  return new Database(context);
}

export { initDatabase };
