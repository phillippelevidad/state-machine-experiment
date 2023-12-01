import util from "./util.js";

export class PaymentGateway {
  pay({ customerId, amount }) {
    const idempotencyKey = util.generateIdempotencyKey({
      customerId,
      amount,
    });
    return util.simulateAsyncOperation(() => ({
      idempotencyKey,
      customerId,
      amount,
      paymentId: "some-payment-id",
      status: "success",
    }));
  }

  refund({ paymentId }) {
    return util.simulateAsyncOperation(() => ({
      paymentId,
      refundId: "some-refund-id",
      status: "success",
    }));
  }

  sendMoneyUsingPix({ amount, pixKey }) {
    const idempotencyKey = util.generateIdempotencyKey({
      amount,
      pixKey,
    });
    return util.simulateAsyncOperation(() => ({
      idempotencyKey,
      pixKey,
      amount,
      pixId: "some-pix-id",
      status: "success",
    }));
  }
}
