import { checkIsCallback } from "../handle/functions.js";
import { errorUtil } from "../util/index.js";

const UNKNOWN_FUNCTION = "unknown function";

class Base {
  constructor(context, caller = { name: UNKNOWN_FUNCTION }) {
    try {
      this.caller = caller?.name ?? UNKNOWN_FUNCTION;
      this.context = context;
      this.handoffs = [];
      this.init();
    } catch (err) {
      this.errorString(
        errorUtil.useErrorFunction("init500", this.caller).message,
      );
      throw err;
    }
  }

  init() {
    console.log(`'${this.caller}' has no init function.`);
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

  cancel(error = null) {
    this.handoffs = [];
    this.res.kill(error);
  }

  exit(error) {
    this.res.kill(error);
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

  // OTHER

  errorString(message) {
    const string = `ERROR @ '${this.caller}': ${message}`;
    console.log(string);
    return string;
  }

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
