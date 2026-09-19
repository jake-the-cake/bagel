import { errorUtil } from "../util/index.js";

class Base {
  constructor(context, caller = { name: "unknown function" }) {
    try {
      this.context = context;
      this.init();
    } catch (err) {
      throw errorUtil.useErrorFunction("init500", caller.name);
    }
  }

  init() {
    pass;
  }

  // CALLBACKS

  callback(callback, ...params) {
    return () => callback(...params);
  }

  callbackAsync(callback, ...params) {
    return async () => await callback(...params);
  }

  // EXECUTIONS

  run(callback, ...params) {
    try {
      return callback(...params);
    } catch (error) {
      this.flag(error);
    }
  }

  async runAsync(callback, ...params) {
    try {
      return await callback(...params);
    } catch (error) {
      this.flag(error);
    }
  }

  // FLAGS

  flag(error) {
    this.res.flag(error);
  }

  // HEALTH

  health() {}

  // HANDOFFS

  handoff(execute, resume, callback) {}

  resume() {
    this.handoffs.forEach((handoff) => {
      Object.entries(handoff).forEach(([k, v]) => {
        this[k].run(v);
      });
    });
  }

  cancel() {
    this.handoffs = [];
  }

  exit(error) {
    this.res.error(error);
  }

  // CONTEXT

  get req() {
    return this.context.req;
  }

  get res() {
    return this.context.res;
  }

  get control() {
    return this.context.control;
  }

  get auth() {
    return this.context.auth;
  }

  get validate() {
    return this.context.validate;
  }

  get data() {
    return this.context.data;
  }

  get details() {
    return this.context.details;
  }

  get db() {
    return this.context.db;
  }

  // OTHER

  get isApi() {
    return this.resOut?.isApi ?? false;
  }
}

// FUNCTIONS AND EXPORTS

function useBaseClass() {
  return Base;
}

export { useBaseClass };
