import jwt from "jsonwebtoken";
import crypto from "crypto";
import { core } from "../../core/index.js";
import { errorUtil } from "../../util/index.js";

const sessions = new Map();

class Auth extends core.useBaseClass() {
  noToken = errorUtil.createError(401, "Missing required token.");
  noSession = errorUtil.createError(401, "Missing required session.");
  badToken = errorUtil.createError(401, "Invalid or expired token.");
  badSession = errorUtil.createError(401, "Invalid or expired session.");
  noAccess = errorUtil.createError(403, "Insufficient access.");
  roles = {
    public: 0,
    user: 1,
    admin: 2,
    owner: 3,
    master: 4,
    god: 5,
  };

  constructor(context) {
    super(context, initAuth);
  }

  init() {
    this.user = null;
    this.permissions = {};
    // SESSION CHECK
    this.resOut.Session = async (companyId) => this.session(companyId);
    // AUTHORIZATION LEVELS
    this.resOut.User = this.setAuthMode("user");
    this.resOut.Admin = this.setAuthMode("admin");
    this.resOut.Owner = this.setAuthMode("owner");
    this.resOut.Master = this.setAuthMode("master");
    this.resOut.God = this.setAuthMode("god");
  }

  // SESSION

  checkSession() {
    const sessionId = this.req.headers["x-session-id"];
    if (!sessionId) this.flag(this.noSession);
    const token = this.getToken();
    if (!token) this.flag(this.noToken);
    return !sessionId || !token
      ? null
      : {
          sessionId,
          token,
        };
  }

  async session(companyId = null) {
    try {
      const session = this.checkSession();
      if (!session) return this.exit();
      const payload = this.verifyToken(session.token);
      if (!payload) return this.kill(this.badToken);
      if (!this.validateSession(session.sessionId, payload)) {
        return this.kill(this.badSession);
      }
      if (companyId !== null) {
        const membership = await this.control
          .read("company_users")
          .where({
            user_id: payload.userId,
            company_id: companyId,
          })
          .one();
        if (!membership) return this.kill(this.noAccess);
        payload.companyId = companyId;
      }
      return await this.control.session(session, payload);
    } catch (error) {
      return this.kill(error);
    }
  }

  createSession(userId) {
    const sessionId = crypto.randomUUID();
    sessions.set(sessionId, {
      userId,
      createdAt: Date.now(),
    });
    return sessionId;
  }

  validateSession(sessionId, payload) {
    const session = sessions.get(sessionId);
    if (!session) return false;
    return session.userId === payload.userId;
  }

  removeSession(sessionId) {
    sessions.delete(sessionId);
  }

  /**
   * Call this after the user's login credentials have been
   * successfully authenticated.
   */
  loginSession(userId) {
    const previous = this.previousSession(userId);
    const payload = {
      userId,
      companyId: previous?.companyId ?? null,
    };
    const sessionId = this.createSession(userId);
    const token = this.createToken(payload);
    return {
      sessionId,
      token,
      payload,
    };
  }

  previousSession(userId) {
    const sessionId = this.req.headers["x-session-id"];
    const token = this.getToken();
    if (!sessionId || !token) return null;
    const payload = this.verifyToken(token);
    if (!payload) return null;
    if (payload.userId !== userId) return null;
    if (!this.validateSession(sessionId, payload)) return null;
    return payload;
  }

  // AUTHORIZATION

  setAuthMode(title) {
    return async (...permissions) => this.authenticate(title, permissions);
  }

  async authenticate(title, permissions) {
    if (this.dead) return;
    const token = this.getToken();
    if (!token) return this.kill(this.noToken);
    this.user = this.verifyToken(token);
    if (!this.user) return this.kill(this.badToken);
    const sessionId = this.req.headers["x-session-id"];
    if (!sessionId) return this.kill(this.noSession);
    if (!this.validateSession(sessionId, this.user)) {
      return this.kill(this.badSession);
    }
    if (!(await this.checkRole(title))) return this.kill(this.noAccess);
    permissions.length && this.permissions(permissions);
  }

  getToken() {
    const auth = this.details.headers?.authorization;
    if (!auth?.startsWith("Bearer ")) return null;
    return auth.slice(7).trim() || null;
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return null;
    }
  }

  createToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });
  }

  refreshToken(token) {
    const payload = this.verifyToken(token);
    if (!payload) return null;
    return this.createToken({
      userId: payload.userId,
      companyId: payload.companyId ?? null,
    });
  }

  async checkRole(title) {
    if (!this.user) return false;
    const requiredRole = this.roles[title];
    if (requiredRole === undefined) return false;
    if (title === "user") return true;
    if (!this.user.companyId) return false;
    const membership = await this.control
      .read("company_users")
      .where({
        user_id: this.user.userId,
        company_id: this.user.companyId,
      })
      .one();
    if (!membership) return false;
    const userRole = this.roles[membership.role];
    return userRole !== undefined && userRole >= requiredRole;
  }

  permissions(permissions) {}
}

function initAuth(context) {
  return new Auth(context);
}

export { initAuth };
