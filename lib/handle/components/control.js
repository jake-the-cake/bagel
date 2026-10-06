import { useBaseClass } from "../../core/base.js";
import { initDatabase } from "../../data/handle.js";
import { DEFAULT_STATUS } from "../../util/codes.js";
import { errorUtil } from "../../util/index.js";

const NO_USER = errorUtil.createError(404, "User email is not registered.");
const INVALID_PW = errorUtil.createError(401, "Incorrect password entered.");
const TOKEN_REQUIRED = errorUtil.createError(
  401,
  "Authentication token is required.",
);

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
    this.resOut.Session = async () => this.session();
    this.resOut.Login = () => this.login();
    this.resOut.Logout = () => this.logout();
    this.data = initDatabase();
  }

  initControl(control) {
    return (table, id = "id") => this[control](table, id);
  }

  // AUTH

  async login() {
    const model = this.schema.use("users");
    const user = await this.execute(() =>
      this.data.selectFrom("users").filter({ email: model.email }).one(),
    );
    if (!user) return this.kill(NO_USER);
    if (user.password !== model.password) return this.kill(INVALID_PW);
    const token = this.auth.createToken({
      user,
    });
    this.resOut.setHeader("token", token);
    return user;
  }

  async logout() {
    this.resOut.removeHeader("token");
    return null;
  }

  async refresh() {
    const token = this.req.headers.authorization?.split(" ")[1];
    if (!token) return this.kill(TOKEN_REQUIRED);
    try {
      const payload = this.auth.verifyToken(token);
      const token = this.auth.createToken({
        user: payload.user,
      });
      this.resOut.setHeader("token", token);
      return payload.user;
    } catch (error) {
      return this.kill(
        errorUtil.createError(
          401,
          "Authentication token is invalid or expired.",
        ),
      );
    }
  }

  // USER AND COMPANY DATA COMPILATION

  async compileUserData(userId) {
    const user = await this.read("users").byId(userId);
    if (!user) throw errorUtil.createError(404, "User not found for session.");
    delete user.password;
    const profile = await this.read("user_profiles").byId(userId);
    delete profile?.user_id;
    const phone = await this.read("user_phones")
      .where({ active: true })
      .byId(userId);
    delete phone?.user_id;
    const companies = await this.read("company_users")
      .where({ user_id: userId })
      .all();
    return {
      details: { ...user, ...profile, phone },
      companies,
      permissions: {},
    };
  }

  compileCompanyData(companyId, companies) {
    const company = companies?.filter((c) => c.company_id === companyId);
    return company.length ? company[0] : null;
  }

  // SESSION

  async compileSession(payload) {
    const user = await this.compileUserData(payload.user_id);
    const company = this.compileCompanyData(payload.company_id, user.companies);
    return { user, company };
  }

  async session(payload, sessionId) {
    if (this.dead) return;
    this.resOut.setHeader("x-session-id", sessionId);
    return await this.compileSession(payload);
  }
  // EXECUTE

  async execute(callback) {
    if (this.dead) return null;
    try {
      const result = await callback();
      return this.ok ? result : null;
    } catch (error) {
      this.flag(
        errorUtil.createError(error?.status ?? DEFAULT_STATUS, error.message),
      );
      return null;
    }
  }

  // CREATE

  create(table) {
    return {
      save: async () => {
        const result = await this.execute(() => {
          const model = this.schema.use(table);
          return this.data.insertInto(table).values(model).returning().run();
        });
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
        return result ?? null;
      },
      byId: async (value) => {
        const result = await this.execute(() =>
          this.data
            .selectFrom(table)
            .filter({ [id]: value })
            .one(),
        );
        return result ?? null;
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
        return result ?? null;
      },
      many: async (amount) => {
        const result = await this.execute(() => query.many(amount));
        return result ?? null;
      },
      all: async () => {
        const result = await this.execute(() => query.all());
        return result ?? null;
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
