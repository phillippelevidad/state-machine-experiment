import { describe, it } from "mocha";
import { expect } from "chai";
import sinon from "sinon";
import { CreditFlowActions } from "../../src/internal/CreditFlowActions.js";
import { CreditFlowActionsWithLogging } from "../../src/internal/CreditFlowActionsWithLogging.js";

const actions = new CreditFlowActions({});
sinon.stub(actions, CreditFlowActions.prototype.start.name).resolves();
sinon.stub(actions, CreditFlowActions.prototype.processPayment.name).resolves();
sinon.stub(actions, CreditFlowActions.prototype.exchangeCrypto.name).resolves();
sinon
  .stub(actions, CreditFlowActions.prototype.processWithdraw.name)
  .resolves();
sinon
  .stub(actions, CreditFlowActions.prototype.rollbackFromPaymentFailure.name)
  .resolves();
sinon
  .stub(actions, CreditFlowActions.prototype.rollbackFromCryptoFailure.name)
  .resolves();
sinon
  .stub(actions, CreditFlowActions.prototype.rollbackFromWithdrawFailure.name)
  .resolves();
sinon.stub(actions, CreditFlowActions.prototype.onSuccess.name).resolves();
sinon.stub(actions, CreditFlowActions.prototype.onFailure.name).resolves();

const wrapper = new CreditFlowActionsWithLogging({
  creditFlowActions: actions,
});

describe("CreditFlowActionsWithLogging", () => {
  describe("start", () => {
    it("calls the credit flow actions' start method", () => {
      return wrapper.start({}).then(() => {
        expect(actions.start.calledOnce).to.equal(true);
      });
    });
  });

  describe("processPayment", () => {
    it("calls the credit flow actions' processPayment method", () => {
      return wrapper.processPayment({}).then(() => {
        expect(actions.processPayment.calledOnce).to.equal(true);
      });
    });
  });

  describe("exchangeCrypto", () => {
    it("calls the credit flow actions' exchangeCrypto method", () => {
      return wrapper.exchangeCrypto({}).then(() => {
        expect(actions.exchangeCrypto.calledOnce).to.equal(true);
      });
    });
  });

  describe("processWithdraw", () => {
    it("calls the credit flow actions' processWithdraw method", () => {
      return wrapper.processWithdraw({}).then(() => {
        expect(actions.processWithdraw.calledOnce).to.equal(true);
      });
    });
  });

  describe("rollbackFromPaymentFailure", () => {
    it("calls the credit flow actions' rollbackFromPaymentFailure method", () => {
      return wrapper.rollbackFromPaymentFailure({}).then(() => {
        expect(actions.rollbackFromPaymentFailure.calledOnce).to.equal(true);
      });
    });
  });

  describe("rollbackFromCryptoFailure", () => {
    it("calls the credit flow actions' rollbackFromCryptoFailure method", () => {
      return wrapper.rollbackFromCryptoFailure({}).then(() => {
        expect(actions.rollbackFromCryptoFailure.calledOnce).to.equal(true);
      });
    });
  });

  describe("rollbackFromWithdrawFailure", () => {
    it("calls the credit flow actions' rollbackFromWithdrawFailure method", () => {
      return wrapper.rollbackFromWithdrawFailure({}).then(() => {
        expect(actions.rollbackFromWithdrawFailure.calledOnce).to.equal(true);
      });
    });
  });

  describe("onSuccess", () => {
    it("calls the credit flow actions' onSuccess method", () => {
      return wrapper.onSuccess({}).then(() => {
        expect(actions.onSuccess.calledOnce).to.equal(true);
      });
    });
  });

  describe("onFailure", () => {
    it("calls the credit flow actions' onFailure method", () => {
      return wrapper.onFailure({}).then(() => {
        expect(actions.onFailure.calledOnce).to.equal(true);
      });
    });
  });
});
