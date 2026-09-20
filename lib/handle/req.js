import { useBaseClass } from "../core/base.js";
import { coloredCode, DEFAULT_STATUS } from "../util/codes.js";

class Req extends useBaseClass() {
  constructor(context) {
    super(context, initRequest);
  }

  init() {
    this.context.new("responseLine", (status) => {
      return this.formatResponseLine(
        this.details,
        coloredCode(status || DEFAULT_STATUS),
      );
    });
  }

  formatResponseLine({ method, path, ip, start }, status) {
    return [
      new Date(),
      method,
      path,
      status,
      `(@ ${ip})`,
      `in ${Number(new Date()) - start} ms`,
    ];
  }
}

function initRequest(context) {
  return new Req(context);
}

export { initRequest };
