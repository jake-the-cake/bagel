import { dataGoat } from "../../datagoat/index.js";
import { getDb } from "../data/db.js";
import { handle } from "../handle/index.js";

class Control {
  constructor(resOut) {
    this.resOut = resOut;
    this.db = null;
    this.sql = null;

    try {
      this.db = getDb();
      this.sql = dataGoat(this.db);
    } catch (err) {
      this.flag(handle.createError(500, err.message));
    }
  }

  // CHECKS

  async checkTable(tableName) {
    return await this.sql.checkTable(tableName);
  }

  // CREATE

  create(table, data) {
    return {
      save: async () => {
        return this.run(async () => {
          const result = await this.sql.insertInto(table).values(data);

          return this.handleResult(result);
        });
      },
    };
  }

  // READ

  read(table, id = "id") {
    return {
      all: async () => {
        return this.run(async () => {
          const result = await this.sql.selectFrom(table).all();

          return this.handleResult(result);
        });
      },

      byId: async (value) => {
        return this.run(async () => {
          const result = await this.sql
            .selectFrom(table)
            .filter({ id: value })
            .one();

          const data = this.handleResult(result);

          if (result.error) {
            this.flag(useError("general404"));
            return;
          }

          return data;
        });
      },
    };
  }

  // UPDATE

  update(table, id = "id") {
    return {
      byId: async (value, data) => {
        return this.run(async () => {
          const result = await this.sql
            .updateRow(table)
            .set(data)
            .filter({ [id]: value })
            .run();

          return this.handleResult(result);
        });
      },
    };
  }

  // DELETE

  delete(table, id = "id") {
    return {
      byId: async (value) => {
        return this.run(async () => {
          const result = await this.sql
            .deleteFrom(table)
            .filter({ [id]: value })
            .run();

          return this.handleResult(result);
        });
      },
    };
  }

  // EXECUTIONS

  handleResult(result) {
    result.error && this.flag(result.error);
    return result;
  }

  async run(callback, validations = []) {
    if (this.resOut.flags.length > 0) return;

    try {
      const result = await callback();

      validations.forEach((validation) => validation());

      return result;
    } catch (err) {
      // Anything that unexpectedly throws still becomes a 500
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
