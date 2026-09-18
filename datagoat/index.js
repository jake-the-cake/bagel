import { useError } from "../lib/util/err.js";
import { dbStrings } from "./config/strings.js";

async function runQuery(db, string) {
  string = typeof string === "string" ? string : string.join(" ");
  return await db.query(string);
}

class SQL {
  SELECT = "SELECT";
  FROM = "FROM";
  LIMIT = "LIMIT";
  WHERE = "WHERE";
  INSERT = "INSERT INTO";
  UPDATE = "UPDATE";
  DELETE = "DELETE FROM";
  SET = "SET";
  VALUES = "VALUES";

  constructor(db) {
    this.db = db;
    this.params = {};
    this.keys = [];
    this.command = this.SELECT;
  }

  // QUERY STRING BUILDING CYCLE

  quote(value) {
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(value)) {
      throw new Error(`Invalid SQL identifier: ${value}`);
    }
    return `'${value}'`;
  }

  write(...values) {
    return values.join(" ");
  }

  parse(...values) {
    return values[0]?.length ? values.join(", ") : "*";
  }

  record(key, value) {
    this.params[key] = value;
    if (!this.keys.includes(key)) {
      this.keys.push(key);
    }
  }

  commandLine() {
    return this.write(this.command, this.params[this.command]);
  }

  // ACTIONS

  selectFrom(tableName) {
    this.command = this.SELECT;
    this.params[this.SELECT] = "*";
    this.record(this.FROM, tableName);
    return this;
  }

  insertInto(tableName) {
    this.command = this.INSERT;
    this.params[this.INSERT] = tableName;
    return this;
  }

  updateRow(tableName) {
    this.command = this.UPDATE;
    this.params[this.UPDATE] = tableName;
    return this;
  }

  deleteFrom(tableName) {
    this.command = this.DELETE;
    this.params[this.DELETE] = tableName;
    return this;
  }

  // FILTERS

  columns(...columns) {
    this.params[this.SELECT] = this.parse(...columns);
    return this;
  }

  filter(props) {
    const filters = [];

    Object.entries(props).forEach(([k, v]) => {
      filters.push(`${k} = ${this.quote(v)}`);
    });

    this.record(this.WHERE, this.parse(...filters));
    return this;
  }

  async all() {
    const { rows } = await this.run();
    return { data: rows };
  }

  async one() {
    this.record(this.LIMIT, 1);
    const { rows } = await this.run();
    return rows[0] ? { data: rows[0] } : { error: useError("general404") };
  }

  async many(amount) {
    this.record(this.LIMIT, amount);
    const { rows } = await this.run();
    return { data: rows };
  }

  // DATA

  async values(props) {
    const columns = [];
    const values = [];

    Object.entries(props).forEach(([k, v]) => {
      columns.push(k);
      values.push(v);
    });
    this.params[this.INSERT] += ` (${this.parse(...columns)})`;
    this.record(this.VALUES, `(${this.parse(...values)})`);
    const { rows } = this.run();
    return { data: rows };
  }

  set(props) {
    const values = [];

    Object.entries(props).forEach(([k, v]) => {
      values.push(`${k} = ${v}`);
    });

    this.record(this.SET, this.parse(...values));
    return this;
  }

  // EXECUTIONS

  async run() {
    return await runQuery(this.db, this.query());
  }

  query() {
    const query = [this.commandLine()];

    this.keys.forEach((key) => {
      query.push(this.write(key, this.params[key]));
    });

    console.log(this.write(...query));

    return this.write(...query);
  }

  // CHECKS

  async checkTable(tableName) {
    const { rows } = await this.db.query(dbStrings.tableExists(tableName));
    return rows[0]?.exists === true;
  }
}

// EXPORTED FUNCTIONS

function dataGoat(db) {
  return new SQL(db);
}

export { dataGoat };
