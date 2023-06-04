"use strict";

await import("should");
import * as Common from "../../../src/Common/index.js";

describe("type guards HandlerFunction", () => {
  it("should compile the code", () => {
    const func = () => { return };
    if (Common.isHandlerFunction(func)) {
      func();
    }
  });

  it("should return true if function", () => {
    Common.isHandlerFunction(() => { return}).should.be.true();
  });

  it("should return false if not function", () => {
    Common.isHandlerFunction("MyHandler").should.be.false();
  });
});
