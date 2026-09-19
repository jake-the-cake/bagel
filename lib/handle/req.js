import { useBaseClass } from "../core/base.js";

class Req extends useBaseClass() {
  constructor(context) {
    super(context, initRequest);
  }

  init() {
    console.log(`Incoming request... INIT`);
  }
}

function initRequest(context) {
  return new Req(context);
}

export { initRequest };
