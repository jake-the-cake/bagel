import { objectUtil } from "../util/index.js";

class Health {
  constructor() {
    this.failed = false;
    this.flags = [];
  }

  isOk() {
    return this.flags.length > 0;
  }

  isFailed() {
    return this.failed;
  }

  get errors() {
    return this.compileErrors();
  }

  // FLAGGING

  kill(flag) {
    this.failed = true;
    flag = this.verifyFlag(flag);
    flag.fatal = true;
    this.flag(flag);
    return flag;
  }

  flag(flag) {
    flag = this.verifyFlag(flag);
    this.flags.push(flag);
    return flag;
  }

  verifyFlag(flag) {
    return this.isValidFlag(flag) ? flag : errorUtil.useError("default");
  }

  isValidFlag(flag) {
    return (
      typeof flag === "object" &&
      objectUtil.hasAllProps(flag, "status", "label", "message")
    );
  }

  // ERROR OUT

  andThen(error, next) {
    if (!error.then) {
      error.then = { ...next };
      return;
    }
    this.andThen(error.then, next);
  }

  stackErrors(length) {
    const error = { ...this.flags[0] };
    if (length > 1) {
      for (let i = 1; i < length; i++) {
        this.andThen(error, this.flags[i]);
      }
    }
    return error;
  }

  compileErrors() {
    const length = this.flags.length || 0;
    return length === 0
      ? errorUtil.createError(DEFAULT_STATUS, "No errors to compile.")
      : this.stackErrors(length);
  }
}

function initHealth() {
  return new Health();
}

export { initHealth };
