import { useBaseClass } from "../core/base.js";
import { errorUtil } from "../util/index.js";

class Control extends useBaseClass() {
  constructor(context) {
    super(context, initController);
  }

  init() {
    this.resOut.Create = (table, data) => this.create(table, data);
    this.resOut.Read = (table, id) => this.read(table, id);
    this.resOut.Update = (table, id) => this.update(table, id);
    this.resOut.Delete = (table, id) => this.delete(table, id);
  }

  // CREATE

  create(table, data) {
    return {
      save: async () => {
        return this.run(async () => {
          const result = await this.data.insertInto(table).values(data);
          console.log(result);
          if (!(await result.data.length))
            this.resOut.Flag(errorUtil.defaultError());
          return await result;
        });
      },
    };
  }

  // READ

  read(table, id = "id") {
    return {
      all: async () => {
        return this.run(async () => {
          return await this.data.selectFrom(table).all();
        });
      },
      byId: async (value) => {
        return this.run(async () => {
          const result = await this.data
            .selectFrom(table)
            .filter({ id: value })
            .one();
          if (!result) this.flag(useError("general404"));
          return result;
        });
      },
    };
  }

  // UPDATE

  update(table, id = "id") {
    return {
      byId: async (value, data) => {
        return this.run(async () => {
          return await this.data
            .updateRow(table)
            .set(data)
            .filter({ [id]: value })
            .run();
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
}

function initController(context) {
  return new Control(context);
}

export { initController };
