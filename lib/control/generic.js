import { getDb } from "../data/db.js";
import { handle } from "../handle/index.js";
import { useError } from "../util/err.js";

class Control {
  constructor(resOut) {
    this.resOut = resOut;
    this.error = null;
    try {
      this.db = getDb();
    } catch (err) {
      this.flag(handle.createError(500, err.message));
    }
  }

  async checkTable(tableName) {
    const { rows } = await this.db.query(
      `SELECT EXISTS (
           SELECT 1
           FROM information_schema.tables
           WHERE table_schema = $1 AND table_name = $2
         ) AS "exists"`,
      ["public", tableName],
    );
    if (rows[0]?.exists === true) return true;
    this.flag(handle.createError(400, `Table "${tableName}" does not exist.`));
  }

  async selectAllFromTable(table, id = "id") {
    if ((await this.checkTable(table)) !== true) return null;
    const tableName = this.quote(table);
    const idName = this.quote(id);
    const { rows } = await this.db.query(
      `SELECT * FROM ${tableName} ORDER BY ${idName} DESC`,
    );
    return rows;
  }

  async selectByIdFromTable(table, idValue, id = "id") {
    if ((await this.checkTable(table)) !== true) return null;
    const tableName = this.quote(table);
    const idName = this.quote(id);
    const { rows } = await this.db.query(
      `SELECT * FROM ${tableName} WHERE ${idName} = $1`,
      [idValue],
    );
    return rows[0] || null;
  }

  read(table, id = "id") {
    return {
      all: async () => {
        return this.run(async () => {
          return await this.selectAllFromTable(table);
        });
      },
      byId: async (value) => {
        return this.run(async () => {
          const data = await this.selectByIdFromTable(table, value, id);
          if (!data) {
            this.flag(useError("general404"));
            return;
          }
          this.resOut.json(200, { data: data });
        });
      },
    };
  }

  quote(name) {
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) {
      throw new Error(`Invalid SQL identifier: ${name}`);
    }
    return `"${name}"`;
  }

  async run(callback, validations = []) {
    if (this.resOut.flags.length > 0) return;
    try {
      const result = await callback();
      validations.forEach((validation) => {
        validation();
      });
      return result;
    } catch (err) {
      this.flag(handle.createError(500, err.message));
    }
  }

  flag(error) {
    this.resOut.flag(error);
  }
}

function crudController(resOut) {
  return new Control(resOut);
}

export { crudController };

function crudController1(table, fields, id = "id") {
  const dataFrom = (body) =>
    Object.fromEntries(
      fields
        .filter((field) => body[field] !== undefined)
        .map((field) => [field, body[field]]),
    );

  const create = async (req, res, next) => {
    try {
      const data = dataFrom(req.body);
      const columns = Object.keys(data);

      if (!columns.length) {
        return res.status(400).json({ error: "No valid fields provided." });
      }

      const values = Object.values(data);
      const names = columns.map(formatWithQuotes).join(", ");
      const slots = values.map((_, i) => `$${i + 1}`).join(", ");

      const { rows } = await db.query(
        `INSERT INTO ${tableName} (${names}) VALUES (${slots}) RETURNING *`,
        values,
      );

      res.status(201).json(rows[0]);
    } catch (error) {
      next(error);
    }
  };

  const update = async (req, res, next) => {
    try {
      const data = dataFrom(req.body);
      const columns = Object.keys(data);

      if (!columns.length) {
        return res.status(400).json({ error: "No valid fields provided." });
      }

      const values = Object.values(data);
      const changes = columns
        .map((column, i) => `${formatWithQuotes(column)} = $${i + 1}`)
        .join(", ");

      const { rows } = await db.query(
        `UPDATE ${tableName}
         SET ${changes}
         WHERE ${idName} = $${values.length + 1}
         RETURNING *`,
        [...values, req.params.id],
      );

      if (!rows[0]) {
        return res.status(404).json({ error: "Not found." });
      }

      res.json(rows[0]);
    } catch (error) {
      next(error);
    }
  };

  const remove = async (req, res, next) => {
    try {
      const { rowCount } = await db.query(
        `DELETE FROM ${tableName} WHERE ${idName} = $1`,
        [req.params.id],
      );

      if (!rowCount) {
        return res.status(404).json({ error: "Not found." });
      }

      res.status(204).end();
    } catch (error) {
      next(error);
    }
  };

  return { list, get, create, update, remove };
}

// export { crudController };
