import { useBaseClass } from "../core/base.js";
import { coloredCode, DEFAULT_STATUS } from "../util/codes.js";
import { errorUtil } from "../util/index.js";
import functions from "./functions.js";

class Req extends useBaseClass() {
  constructor(context) {
    super(context, initRequest);
  }

  init() {
    this.resOut.Allow = (...methods) => this.verifyAllowedMethods(...methods);
    this.context.responseLine = (status) => {
      return functions.formatResponseLine(
        this.details,
        coloredCode(status || DEFAULT_STATUS),
      );
    };
  }

  verifyAllowedMethods(...methods) {
    const method = this.details.method;
    if (!methods.includes(method)) {
      this.flag(
        errorUtil.createError(
          405,
          `'${method}' method is not allowed at this endpoint.`,
        ),
      );
    }
  }
}

function initRequest(context) {
  return new Req(context);
}

export { initRequest };
