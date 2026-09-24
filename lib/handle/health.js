import { objectUtil } from "../util/index.js";

class Health {
  constructor() {
    this.flags = [];
    this.result = {
      ok: true,
    };
  }

  setData(data) {
    this.result.data = data;
  }

  setError() {
    this.result.error = this.compileErrors();
  }

  checkOk() {
    return this.flags.length > 0;
  }

  notOk() {
    this.result.ok = false;
  }

  // FLAGGING

  flag(flag) {
    console.log("flag", flag);
    flag = this.verifyFlag(flag);
    this.flags.push(flag);
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

  // EXITING

  exit() {
    this.notOk();
    this.setError();
    return this.result;
  }

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

function initHealth(resOut) {
  return new Health(resOut);
}

export { initHealth };
