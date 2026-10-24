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
    if (this.dead) return;
    if (!user) return this.kill(NO_USER);
    if (user.password !== model.password) return this.kill(INVALID_PW);
    const authSession = this.auth.loginSession(user.id);
    if (!authSession) return this.kill(TOKEN_REQUIRED);
    const { sessionId, token, payload } = authSession;
    const session = await this.compileSession(payload);
    if (this.dead) return;
    this.resOut.setHeader("x-session-id", sessionId);
    this.resOut.setHeader("token", token);
    return session;
  }

  async logout() {
    const sessionId = this.req.headers["x-session-id"];
    if (sessionId) {
      this.auth.removeSession(sessionId);
    }
    this.resOut.removeHeader("x-session-id");
    this.resOut.removeHeader("token");
    return null;
  }

  async refresh() {
    const session = this.auth.checkSession();
    if (!session) return this.kill(TOKEN_REQUIRED);
    const payload = this.auth.verifyToken(session.token);
    if (!payload) return this.kill(TOKEN_REQUIRED);
    if (!this.auth.validateSession(session.sessionId, payload)) {
      return this.kill(this.auth.badSession);
    }
    const token = this.auth.createToken({
      userId: payload.userId,
      companyId: payload.companyId ?? null,
    });
    this.resOut.setHeader("token", token);
    return await this.compileSession(payload);
  }

  // USER AND COMPANY DATA COMPILATION

  async compileUserData(userId) {
    const user = await this.read("users").byId(userId);
    if (!user) {
      throw errorUtil.createError(404, "User not found for session.");
    }
    delete user.password;
    const profile = await this.read("user_profiles").byId(userId);
    if (profile) delete profile.user_id;
    const phone = await this.read("user_phones", "user_id")
      .where({ active: true })
      .byId(userId);
    if (phone) delete phone.user_id;
    const companies = await this.read("company_users")
      .where({ user_id: userId })
      .all();
    return {
      details: {
        ...user,
        ...profile,
        phone,
      },
      companies,
      permissions: {},
    };
  }

  compileCompanyData(companyId, companies) {
    if (!companyId) return null;
    return (
      companies?.find((company) => company.company_id === companyId) ?? null
    );
  }

  // SESSION

  async compileSession(payload) {
    const user = await this.compileUserData(payload.userId);
    const company = this.compileCompanyData(payload.companyId, user.companies);
    return {
      user,
      company,
    };
  }

  async session(session, payload) {
    if (this.dead) return;
    if (!this.auth.validateSession(session.sessionId, payload)) {
      return this.kill(this.auth.badSession);
    }
    const compiled = await this.compileSession(payload);
    if (this.dead) return;
    const token = this.auth.createToken({
      userId: payload.userId,
      companyId: compiled.company?.company_id ?? null,
    });
    this.resOut.setHeader("x-session-id", session.sessionId);
    this.resOut.setHeader("token", token);
    return compiled;
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
    const options = {
      filters: {},
      sort: null,
      limit: null,
    };
    const build = () => {
      let statement = this.data.selectFrom(table);
      if (Object.keys(options.filters).length) {
        statement = statement.filter(options.filters);
      }
      if (options.sort) {
        statement = statement.sort(options.sort.column, options.sort.direction);
      }
      return statement;
    };
    const query = {
      where: (filters) => {
        Object.assign(options.filters, filters);
        return query;
      },
      sort: (column, direction = "ASC") => {
        options.sort = { column, direction };
        return query;
      },
      limit: (amount) => {
        options.limit = amount;
        return query;
      },
      one: async () => {
        return await this.execute(() => build().one());
      },
      many: async (amount) => {
        return await this.execute(() => build().many(amount));
      },
      all: async () => {
        return await this.execute(() => {
          const statement = build();
          return options.limit === null
            ? statement.all()
            : statement.many(options.limit);
        });
      },
      byId: async (value) => {
        return await this.execute(() =>
          build()
            .filter({ [id]: value })
            .one(),
        );
      },
    };
    return query;
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
