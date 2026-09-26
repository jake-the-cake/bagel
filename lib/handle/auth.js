import { useBaseClass } from "../core/base.js";
import { errorUtil } from "../util/index.js";
import jwt from "jsonwebtoken";

class Auth extends useBaseClass() {
  noToken = errorUtil.createError(401, "Missing required token.");
  badToken = errorUtil.createError(401, "Invalid of expired token.");
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
    this.resOut.User = this.setAuthMode("user");
    this.resOut.Admin = this.setAuthMode("admin");
    this.resOut.Owner = this.setAuthMode("owner");
    this.resOut.Master = this.setAuthMode("master");
    this.resOut.God = this.setAuthMode("god");
  }

  setAuthMode(title) {
    return async (...permissions) => this.authenticate(title, permissions);
  }

  async authenticate(title, permissions) {
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
