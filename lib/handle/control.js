import { useBaseClass } from "../core/base.js";
import { errorUtil } from "../util/index.js";

class Control extends useBaseClass() {
  constructor(context) {
    super(context);
    this.results = { data: null, error: null };
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
          const result = await this.data.insertInto(table).values(data);

          return this.handleResult(result);
        });
      },
    };
  }

  // READ

  read(table) {
    return {
      all: async () => {
        return this.run(async () => {
          const result = await this.data.selectFrom(table).all();

          return this.handleResult(result);
        });
      },

      byId: async (value) => {
        return this.run(async () => {
          const result = await this.data
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
          const result = await this.data
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
          const result = await this.data
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
    if (this.res && this.res.flags.length > 0) return;

    try {
      const result = await callback();

      validations.forEach((validation) => validation());

      return result;
    } catch (err) {
      // Anything that unexpectedly throws still becomes a 500
      this.flag(errorUtil.createError(500, err.message));
    }
  }
}

function initController(context) {
  return new Control(context);
}

export { initController };
