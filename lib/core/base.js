import { checkIsCallback } from "../handle/functions.js";
import { initHealth } from "../handle/health.js";
import { errorUtil } from "../util/index.js";

const UNKNOWN_FUNCTION = "unknown function";

class Base {
  constructor(context, caller = { name: UNKNOWN_FUNCTION }) {
    try {
      this.caller = caller?.name ?? UNKNOWN_FUNCTION;
      this.context = context;
      this.health = initHealth();
      this.init();
    } catch (error) {
      throw this.initFail;
    }
  }

  init() {
    console.log(`'${this.caller}' has no init function.`);
  }

  initFail(error) {
    const message = `${errorUtil.useErrorFunction("init500", this.caller).message} (${error.message})`;
    return errorUtil.createError(500, message, true);
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

  // HEALTH

  flag(error) {
    this.health.flag(error);
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
    return this.context.reqDetails;
  }

  get db() {
    return this.context.db;
  }

  get isApi() {
    return this.context.isApi;
  }

  get resOut() {
    return this.context.resOut;
  }

  get reqIn() {
    return this.context.reqIn;
  }

  // HELPERS

  checkIsCallback(callback) {
    if (!checkIsCallback(callback))
      this.flag(errorUtil.useError("notCallback500"));
  }
}

// FUNCTIONS AND EXPORTS

function useBaseClass() {
  return Base;
}

export { useBaseClass };
