import { beforeEach, describe, it } from "mocha";
import { expect } from "chai";
import sinon from "sinon";
import { PaymentGateway } from "../../src/PaymentGateway.js";
import { PaymentGatewayWithRetries } from "../../src/internal/PaymentGatewayWithRetries.js";

const gateway = new PaymentGateway();
sinon.spy(gateway, PaymentGateway.prototype.pay.name);
sinon.spy(gateway, PaymentGateway.prototype.refund.name);
sinon.spy(gateway, PaymentGateway.prototype.sendMoneyUsingPix.name);

const wrapper = new PaymentGatewayWithRetries({ paymentGateway: gateway });

describe("PaymentGatewayWithRetries", () => {
  beforeEach(() => {
    sinon.resetHistory();
  });

  describe("pay", () => {
    it("calls the payment gateway's pay method", () => {
      return wrapper
        .pay({ customerId: "customer-id", amount: 100 })
        .then(() => {
          expect(gateway.pay.calledOnce).to.equal(true);
        });
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
  });
});
