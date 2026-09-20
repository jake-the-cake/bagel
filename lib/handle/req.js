import { useBaseClass } from "../core/base.js";
import { coloredCode, DEFAULT_STATUS } from "../util/codes.js";

class Req extends useBaseClass() {
  constructor(context) {
    super(context, initRequest);
  }

  init() {
    this.context.new("responseLine", (status) => {
      const { method, path, ip, start } = this.context.reqDetails;
      const coloredStatus = coloredCode(status || DEFAULT_STATUS);
      return [
        new Date(),
        method,
        path,
        coloredStatus,
        `(@ ${ip})`,
        `in ${Number(new Date()) - start} ms`,
      ];
    });
  }
}

function initRequest(context) {
  return new Req(context);
}

export { initRequest };
