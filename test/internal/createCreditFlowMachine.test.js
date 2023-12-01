import { beforeEach, describe, it } from "mocha";
import { expect } from "chai";
import sinon from "sinon";
import { createCreditFlowMachine } from "../../src/internal/createCreditFlowMachine.js";
import { interpret } from "xstate";

describe("createCreditFlowMachine", () => {
  it("returns a machine", () => {
    const machine = createCreditFlowMachine({});
    expect(machine).to.be.an("object");
  });
});

describe("creditFlowMachine", () => {
  let fns = null;

  beforeEach(() => {
    fns = {
      start: sinon.stub().resolves(),
      processPayment: sinon.stub().resolves(),
      exchangeCrypto: sinon.stub().resolves(),
      processWithdraw: sinon.stub().resolves(),
      rollbackFromPaymentFailure: sinon.stub().resolves(),
      rollbackFromCryptoFailure: sinon.stub().resolves(),
      rollbackFromWithdrawFailure: sinon.stub().resolves(),
      onSuccess: sinon.stub().resolves(),
      onFailure: sinon.stub().resolves(),
    };
  });

  it("reaches the `succeeded` state if no errors", (done) => {
    const service = startMachine(fns);
    service.onTransition((state) => {
      if (state.matches("succeeded")) {
        done();
      }
    });
  });

  it("invokes all callback functions for the happy path", async () => {
    const service = startMachine(fns);
    await new Promise((resolve) => {
      service.onDone(() => resolve());
    });

    expect(fns.start.calledOnce, "start").to.be.true;
    expect(fns.processPayment.calledOnce, "processPayment").to.be.true;
    expect(fns.exchangeCrypto.calledOnce, "exchangeCrypto").to.be.true;
    expect(fns.processWithdraw.calledOnce, "processWithdraw").to.be.true;
    expect(fns.onSuccess.calledOnce, "onSuccess").to.be.true;
  });

  it("invokes the `onFailure` callback for any errors", async () => {
    fns.processPayment = sinon.stub().rejects();
    fns.rollbackFromPaymentFailure = sinon.stub().rejects();
    const service = startMachine(fns);
    await new Promise((resolve) => {
      service.onDone(() => resolve());
    });

    expect(fns.onFailure.calledOnce, "onFailure").to.be.true;
  });

  it("reaches the `failedWithSuccessfulRollback` state for a failure with successful rollback", (done) => {
    fns.processPayment = sinon.stub().rejects();
    const service = startMachine(fns);

    service.onTransition((state) => {
      if (state.matches("failedWithSuccessfulRollback")) {
        done();
      }
    });
  });

  it("reaches the `failedPendingReview` state for a failure with a failed rollback", (done) => {
    fns.processPayment = sinon.stub().rejects();
    fns.rollbackFromPaymentFailure = sinon.stub().rejects();
    const service = startMachine(fns);

    service.onTransition((state) => {
      if (state.matches("failedPendingReview")) {
        done();
      }
    });
  });

  it("invokes the `rollbackFromPaymentFailure` callback for a payment failure", async () => {
    fns.processPayment = sinon.stub().rejects();
    const service = startMachine(fns);
    await new Promise((resolve) => {
      service.onDone(() => resolve());
    });

    expect(fns.rollbackFromPaymentFailure.calledOnce).to.be.true;
  });

  it("invokes the `rollbackFromCryptoFailure` callback for a crypto failure", async () => {
    fns.exchangeCrypto = sinon.stub().rejects();
    const service = startMachine(fns);
    await new Promise((resolve) => {
      service.onDone(() => resolve());
    });

    expect(fns.rollbackFromCryptoFailure.calledOnce).to.be.true;
  });

  it("invokes the `rollbackFromWithdrawFailure` callback for a withdraw failure", async () => {
    fns.processWithdraw = sinon.stub().rejects();
    const service = startMachine(fns);
    await new Promise((resolve) => {
      service.onDone(() => resolve());
    });

    expect(fns.rollbackFromWithdrawFailure.calledOnce).to.be.true;
  });
});

function startMachine(callbackFunctions) {
  const machine = createCreditFlowMachine(callbackFunctions);
  const service = interpret(machine);
  service
    .start()
    .send({ type: "START", data: { userId: "some-user-id", amount: 100 } });
  return service;
}
