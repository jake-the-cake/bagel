import { useBaseClass } from "../core/base.js";
import { errorUtil } from "../util/index.js";

const NO_USER = errorUtil.createError(404, "User email is not registered.");
const INVALID_PW = errorUtil.createError(401, "Incorrect password entered.");

class Control extends useBaseClass() {
  constructor(context) {
    super(context, initController);
  }

  // INITIALIZE

  init() {
    this.resOut.Create = this.initControl("create");
    this.resOut.Read = this.initControl("read");
    this.resOut.Update = this.initControl("update");
    this.resOut.Delete = this.initControl("delete");
    this.resOut.Login = () => this.login();
    this.resOut.Logout = () => this.logout();
  }

  initControl(control) {
    return (table, id = "id") => this[control](table, id);
  }

  // AUTH

  async login() {
    const model = this.schema.use("users");
    const result = await this.execute(() =>
      this.data.selectFrom("users").filter({ email: model.email }).one(),
    );
    const user = result?.data ?? null;
    if (!user) return this.kill(NO_USER);
    if (user.password !== model.password) return this.kill(INVALID_PW);
    const token = this.auth.createToken({
      user,
    });
    this.resOut.setHeader("token", token);
    return user;
  }

  async logout() {}

  async refresh() {}

  // EXECUTE

  async execute(callback) {
    if (this.dead) return null;
    try {
      const result = await callback();
      return this.ok ? result : null;
    } catch (error) {
      this.flag(errorUtil.createError(400, error.message));
      return null;
    }
  }

  // CREATE

  create(table) {
    const model = this.schema.use(table);
    return {
      save: async () => {
        const result = await this.execute(() =>
          this.data.insertInto(table).values(model).returning().run(),
        );
        return result?.data?.[0] ?? null;
      },
    };
  }

  // READ

  read(table, id = "id") {
    return {
      all: async () => {
        const result = await this.execute(() =>
          this.data.selectFrom(table).all(),
        );
        return result?.data ?? null;
      },
      byId: async (value) => {
        const result = await this.execute(() =>
          this.data
            .selectFrom(table)
            .filter({ [id]: value })
            .one(),
        );
        return result?.data ?? null;
      },
      where: (filters) => this.readWhere(table, filters),
      sort: (column, direction = "ASC") =>
        this.readSorted(table, column, direction),
    };
  }

  readWhere(table, filters) {
    const query = this.data.selectFrom(table).filter(filters);
    return this.readResults(query);
  }

  readSorted(table, column, direction) {
    const query = this.data.selectFrom(table).sort(column, direction);
    return this.readResults(query);
  }

  readResults(query) {
    return {
      one: async () => {
        const result = await this.execute(() => query.one());
        return result?.data ?? null;
      },
      many: async (amount) => {
        const result = await this.execute(() => query.many(amount));
        return result?.data ?? null;
      },
      all: async () => {
        const result = await this.execute(() => query.all());
        return result?.data ?? null;
      },
    };
  }

  // UPDATE

  update(table, id = "id") {
    return {
      byId: async (value, data = this.details.body) => {
        const result = await this.execute(() =>
          this.data
            .updateRow(table)
            .set(data)
            .filter({ [id]: value })
            .returning()
            .run(),
        );
        return result?.data ?? null;
      },
      where: async (filters, data = this.details.body) => {
        const result = await this.execute(() =>
          this.data
            .updateRow(table)
            .set(data)
            .filter(filters)
            .returning()
            .run(),
        );
        return result?.data ?? null;
      },
    };
  }

  // DELETE

  delete(table, id = "id") {
    return {
      byId: async (value) => {
        const result = await this.execute(() =>
          this.data
            .deleteFrom(table)
            .filter({ [id]: value })
            .returning()
            .run(),
        );
        return result?.data ?? null;
      },
      where: async (filters) => {
        const result = await this.execute(() =>
          this.data.deleteFrom(table).filter(filters).returning().run(),
        );
        return result?.data ?? null;
      },
    };
  }
}

// EXPORTS

function initController(context) {
  return new Control(context);
}

export { initController };
