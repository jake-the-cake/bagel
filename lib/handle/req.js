import { useBaseClass } from "../core/base.js";
import { coloredCode, DEFAULT_STATUS } from "../util/codes.js";
import functions from "./functions.js";

class Req extends useBaseClass() {
  constructor(context) {
    super(context, initRequest);
  }

  init() {
    this.context.responseLine = (status) => {
      return functions.formatResponseLine(
        this.details,
        coloredCode(status || DEFAULT_STATUS),
      );
    };
  }
}

function initRequest(context) {
  return new Req(context);
}

export { initRequest };
