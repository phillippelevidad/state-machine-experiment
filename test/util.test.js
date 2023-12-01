import { describe, it } from "mocha";
import { expect } from "chai";
import util from "../src/util.js";

describe("util", () => {
  describe("simulateAsyncOperation", () => {
    it("returns a promise", () => {
      const promise = util.simulateAsyncOperation(() => {});
      expect(promise).to.be.a("promise");
      expect(promise.then).to.be.a("function");
    });

    it("resolves with the return value of the success callback", () => {
      const promise = util.simulateAsyncOperation(() => "success");
      return promise.then((result) => {
        expect(result).to.equal("success");
      });
    });

    it("rejects with the return value of the error callback", () => {
      const promise = util.simulateAsyncOperation(
        () => {},
        () => "error",
        false
      );
      return promise.catch((result) => {
        expect(result).to.equal("error");
      });
    });
  });

  describe("generateIdempotencyKey", () => {
    it("returns a string", () => {
      const key = util.generateIdempotencyKey({});
      expect(key).to.be.a("string");
    });

    it("returns a different key for different objects", () => {
      const key1 = util.generateIdempotencyKey({ a: 1, b: 2 });
      const key2 = util.generateIdempotencyKey({ a: 1, b: 3 });
      expect(key1).to.not.equal(key2);
    });

    it("returns the same key for the same object", () => {
      const obj = { a: 1, b: 2 };
      const key1 = util.generateIdempotencyKey(obj);
      const key2 = util.generateIdempotencyKey(obj);
      expect(key1).to.equal(key2);
    });

    it("returns the same key for the same object with different key order", () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { b: 2, a: 1 };
      const key1 = util.generateIdempotencyKey(obj1);
      const key2 = util.generateIdempotencyKey(obj2);
      expect(key1).to.equal(key2);
    });
  });
});
