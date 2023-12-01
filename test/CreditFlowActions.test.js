import { beforeEach, describe, it } from "mocha";
import { expect } from "chai";
import sinon from "sinon";
import { CreditFlowActions } from "../src/CreditFlowActions.js";

const database = {
  getUserInfo: sinon.stub().resolves({
    userId: "some-user-id",
    name: "John Doe",
    email: "john.doe@example.com",
    gatewayCustomerId: "some-customer-id",
    pixKey: "some-pix-key",
  }),
  registerCreditTransaction: sinon.stub().resolves({
    id: "some-transaction-id",
  }),
  updateCreditTransaction: sinon.stub().resolves({
    id: "some-transaction-id",
  }),
};

const paymentGateway = {
  pay: sinon.stub().resolves({
    idempotencyKey: "some-idempotency-key",
    customerId: "some-customer-id",
    amount: 100,
    paymentId: "some-payment-id",
    status: "success",
  }),
  refund: sinon.stub().resolves({
    paymentId: "some-payment-id",
    refundId: "some-refund-id",
    status: "success",
  }),
  sendMoneyUsingPix: sinon.stub().resolves({
    idempotencyKey: "some-idempotency-key",
    pixKey: "some-pix-key",
    amount: 100,
    pixId: "some-pix-id",
    status: "success",
  }),
};

const cryptoGateway = {
  purchaseCrypto: sinon.stub().resolves({
    cryptoKey: "BTC",
    fundsAmount: 100,
    cryptoAmount: 0.01,
    status: "success",
  }),
  sellCrypto: sinon.stub().resolves({
    cryptoKey: "BTC",
    cryptoAmount: 0.01,
    fundsAmount: 100,
    status: "success",
  }),
};

const actions = new CreditFlowActions({
  database,
  paymentGateway,
  cryptoGateway,
});

const context = {
  userId: "some-user-id",
  amount: 100,
  userInfo: {
    userId: "some-user-id",
    name: "John Doe",
    email: "john.doe@example.com",
    gatewayCustomerId: "some-customer-id",
    pixKey: "some-pix-key",
  },
  payment: {
    idempotencyKey: "some-idempotency-key",
    customerId: "some-customer-id",
    amount: 100,
    paymentId: "some-payment-id",
    status: "success",
  },
  cryptoPurchase: {
    cryptoKey: "BTC",
    fundsAmount: 100,
    cryptoAmount: 0.01,
    status: "success",
  },
  cryptoSale: {
    cryptoKey: "BTC",
    cryptoAmount: 0.01,
    fundsAmount: 100,
    status: "success",
  },
};

describe("CreditFlowActions", () => {
  beforeEach(() => {
    sinon.resetHistory();
  });

  describe("start", () => {
    it("registers a new credit transaction", async () => {
      await actions.start(context);
      expect(
        database.registerCreditTransaction.calledOnceWith({
          userId: "some-user-id",
          amount: 100,
        })
      ).to.be.true;
    });

    it("returns userInfo and transactionId", async () => {
      const result = await actions.start(context);
      expect(result).to.deep.equal({
        userInfo: {
          userId: "some-user-id",
          name: "John Doe",
          email: "john.doe@example.com",
          gatewayCustomerId: "some-customer-id",
          pixKey: "some-pix-key",
        },
        transactionId: "some-transaction-id",
      });
    });
  });

  describe("processPayment", () => {
    it("pays using payment gateway", async () => {
      await actions.processPayment(context);
      expect(paymentGateway.pay.calledOnce).to.be.true;
    });

    it("updates transaction with payment result", async () => {
      await actions.processPayment(context);
      expect(database.updateCreditTransaction.calledOnce).to.be.true;
    });
  });

  describe("exchangeCrypto", () => {
    it("purchases crypto", async () => {
      await actions.exchangeCrypto(context);
      expect(cryptoGateway.purchaseCrypto.calledOnce).to.be.true;
    });

    it("sells crypto", async () => {
      await actions.exchangeCrypto(context);
      expect(cryptoGateway.sellCrypto.calledOnce).to.be.true;
    });

    it("updates transaction with crypto purchase and sale results", async () => {
      await actions.exchangeCrypto(context);
      expect(database.updateCreditTransaction.calledTwice).to.be.true;
    });
  });

  describe("processWithdraw", () => {
    it("sends money using pix", async () => {
      await actions.processWithdraw(context);
      expect(paymentGateway.sendMoneyUsingPix.calledOnce).to.be.true;
    });

    it("updates transaction with withdraw result", async () => {
      await actions.processWithdraw(context);
      expect(database.updateCreditTransaction.calledOnce).to.be.true;
    });
  });

  describe("rollbackFromPaymentFailure", () => {
    it("updates transaction with the rollback result", async () => {
      await actions.rollbackFromPaymentFailure(context);
      expect(database.updateCreditTransaction.calledOnce).to.be.true;
    });
  });

  describe("rollbackFromCryptoFailure", () => {
    it("refunds payment", async () => {
      await actions.rollbackFromCryptoFailure(context);
      expect(paymentGateway.refund.calledOnce).to.be.true;
    });

    it("updates transaction with the rollback result", async () => {
      await actions.rollbackFromPaymentFailure(context);
      expect(database.updateCreditTransaction.calledOnce).to.be.true;
    });

    it("calls rollbackFromPaymentFailure", async () => {
      const spy = sinon.spy(actions, "rollbackFromPaymentFailure");
      await actions.rollbackFromCryptoFailure(context);
      expect(spy.calledOnce).to.be.true;
    });
  });

  describe("rollbackFromWithdrawFailure", () => {
    it("updates transaction with the rollback result", async () => {
      await actions.rollbackFromWithdrawFailure(context);
      expect(database.updateCreditTransaction.called).to.be.true;
    });

    it("calls rollbackFromCryptoFailure", async () => {
      const spy = sinon.spy(actions, "rollbackFromCryptoFailure");
      await actions.rollbackFromWithdrawFailure(context);
      expect(spy.calledOnce).to.be.true;
    });
  });

  describe("onSuccess", () => {
    it("updates transaction with the transaction result", async () => {
      await actions.onSuccess(context);
      expect(database.updateCreditTransaction.calledOnce).to.be.true;
    });
  });

  describe("onFailure", () => {
    it("updates transaction with the transaction result", async () => {
      await actions.onFailure(context);
      expect(database.updateCreditTransaction.calledOnce).to.be.true;
    });
  });
});
