import { beforeEach, describe, it } from "mocha";
import { expect } from "chai";
import sinon from "sinon";
import { PaymentGateway } from "../../src/PaymentGateway.js";
import {
  PaymentGatewayWithIdempotency,
  resetPaymentGatewayDatabase,
} from "../../src/internal/PaymentGatewayWithIdempotency.js";

const gateway = new PaymentGateway();
sinon.spy(gateway, PaymentGateway.prototype.pay.name);
sinon.spy(gateway, PaymentGateway.prototype.refund.name);
sinon.spy(gateway, PaymentGateway.prototype.sendMoneyUsingPix.name);

const wrapper = new PaymentGatewayWithIdempotency({ paymentGateway: gateway });

describe("PaymentGatewayWithIdempotency", () => {
  beforeEach(() => {
    sinon.resetHistory();
    resetPaymentGatewayDatabase();
  });

  describe("pay", () => {
    it("calls the payment gateway's pay method", () => {
      return wrapper
        .pay({ customerId: "customer-id", amount: 100 })
        .then(() => {
          expect(gateway.pay.calledOnce).to.equal(true);
        });
    });

    it("does not call the payment gateway's pay method twice for the same parameters", async () => {
      await wrapper.pay({ customerId: "customer-id", amount: 100 });
      await wrapper.pay({ customerId: "customer-id", amount: 100 });
      expect(gateway.pay.calledOnce).to.equal(true);
    });

    it("calls the payment gateway's pay method twice for different parameters", async () => {
      await wrapper.pay({ customerId: "customer-id", amount: 100 });
      await wrapper.pay({ customerId: "customer-id", amount: 200 });
      expect(gateway.pay.calledTwice).to.equal(true);
    });
  });

  describe("refund", () => {
    it("calls the payment gateway's refund method", () => {
      return wrapper.refund({ paymentId: "payment-id" }).then(() => {
        expect(gateway.refund.calledOnce).to.equal(true);
      });
    });
  });

  describe("sendMoneyUsingPix", () => {
    it("calls the payment gateway's sendMoneyUsingPix method", () => {
      return wrapper
        .sendMoneyUsingPix({ amount: 100, pixKey: "pix-key" })
        .then(() => {
          expect(gateway.sendMoneyUsingPix.calledOnce).to.equal(true);
        });
    });

    it("does not call the payment gateway's sendMoneyUsingPix method twice for the same parameters", async () => {
      await wrapper.sendMoneyUsingPix({
        amount: 100,
        pixKey: "pix-key",
      });
      await wrapper.sendMoneyUsingPix({
        amount: 100,
        pixKey: "pix-key",
      });
      expect(gateway.sendMoneyUsingPix.calledOnce).to.equal(true);
    });

    it("calls the payment gateway's sendMoneyUsingPix method twice for different parameters", async () => {
      await wrapper.sendMoneyUsingPix({
        amount: 100,
        pixKey: "pix-key",
      });
      await wrapper.sendMoneyUsingPix({
        amount: 200,
        pixKey: "pix-key",
      });
      expect(gateway.sendMoneyUsingPix.calledTwice).to.equal(true);
    });
  });
});
