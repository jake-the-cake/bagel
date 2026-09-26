import { functions } from "../handle/index.js";
import { errorUtil } from "../util/index.js";

const UNKNOWN_FUNCTION = "unknown function";

class Base {
  constructor(context, caller = { name: UNKNOWN_FUNCTION }) {
    try {
      this.caller = caller?.name ?? UNKNOWN_FUNCTION;
      this.context = context;
      this.init();
    } catch (error) {
      throw errorUtil.createError(
        500,
        `${errorUtil.useErrorFunction("init500", this.caller).message} (${error.message})`,
      );
    }
  }

  init() {
    console.log(`'${this.caller}' has no init function.`);
  }

  // EXECUTIONS

  run(callback, ...params) {
    try {
      return callback(...params);
    } catch (error) {
      this.flag(error);
    }
  }

  exit() {
    this.res.error();
  }

  // HEALTH

  kill(error) {
    this.context.health.kill(error);
  }

  flag(error) {
    this.context.health.flag(error);
  }

  checkOk() {
    return this.context.health.isOk();
  }

  checkFailed() {
    return this.context.health.isFailed();
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
}

// FUNCTIONS AND EXPORTS

function useBaseClass() {
  return Base;
}

export { useBaseClass };
