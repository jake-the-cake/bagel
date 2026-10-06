import jwt from "jsonwebtoken";
import { core } from "../../core/index.js";
import { errorUtil } from "../../util/index.js";

class Auth extends core.useBaseClass() {
  noToken = errorUtil.createError(401, "Missing required token.");
  noSession = errorUtil.createError(401, "Missing required session.");
  badToken = errorUtil.createError(401, "Invalid of expired token.");
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
    this.resOut.Session = async () => this.session();
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
    const token = this.req.headers.authorization?.split(" ")[1];
    if (!token) this.flag(this.noToken);
    return !sessionId || !token ? null : { sessionId, token };
  }

  async session() {
    try {
      const session = this.checkSession();
      if (!session) return this.exit();
      const payload = this.verifyToken(session.token);
      return await this.control.session(session, payload);
    } catch (error) {
      return this.kill(error);
    }
  }

  // tbd

  setAuthMode(title) {
    return async (...permissions) => this.authenticate(title, permissions);
  }

  async authenticate(title, permissions) {
    if (this.dead) return;
    const token = this.getToken();
    if (!token) return this.kill(this.noToken);
    this.user = this.verifyToken(token);
    if (!this.user) return this.kill(this.badToken);
    if (!this.checkRole(title)) return this.kill(this.noAccess);
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

  createToken(user) {
    return jwt.sign(user, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });
  }

  refreshToken(token) {
    const user = this.verifyToken(token);
    if (!user) return null;
    return this.createToken(user);
  }

  checkRole(title) {
    if (!this.user) return false;
    const userRole = this.roles[this.user.role];
    const requiredRole = this.roles[title];
    if (userRole === undefined || requiredRole === undefined) return false;
    return userRole >= requiredRole;
  }

  permissions(permissions) {}
}

function initAuth(context) {
  return new Auth(context);
}

export { initAuth };
