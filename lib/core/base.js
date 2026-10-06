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

  // HEALTH

  exit() {
    this.context.health.fail();
    this.res.error();
  }

  kill(error) {
    this.context.health.kill(error);
    this.exit();
  }

  flag(error) {
    this.context.health.flag(error);
  }

  get ok() {
    return this.context.health.isOk;
  }

  get dead() {
    return this.context.health.isFailed;
  }

  // CONTEXT GETTERS

  get res() {
    return this.context.res;
  }

  get resOut() {
    return this.context.resOut;
  }

  get auth() {
    return this.context.auth;
  }

  get schema() {
    return this.context.schema;
  }

  get details() {
    return this.context.reqDetails;
  }

  get isApi() {
    return this.context.isApi;
  }
}

// FUNCTIONS AND EXPORTS

function useBaseClass() {
  return Base;
}

export { useBaseClass };
