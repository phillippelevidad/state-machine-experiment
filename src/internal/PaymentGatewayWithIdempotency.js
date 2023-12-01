import util from "../util.js";
import { PaymentGateway } from "../PaymentGateway.js";

// Uses the Decorator design pattern to add idempotency
// capabilities to the payment gateway. See the PaymentGatewayWithRetries
// class for more details about the Decorator pattern.
// ----------

// This simulates the payment gateway's records.
// The application should use idempotency keys to avoid
// duplicate operations, so we provide a way to check if
// an operation with a given idempotency key has already
// been performed.
const paymentsDatabase = [];
const pixDatabase = [];

// And this will reset the database between tests.
export function resetPaymentGatewayDatabase() {
  paymentsDatabase.length = 0;
  pixDatabase.length = 0;
}

export class PaymentGatewayWithIdempotency extends PaymentGateway {
  constructor({ paymentGateway }) {
    super();
    this.paymentGateway = paymentGateway;
  }

  async pay({ customerId, amount }) {
    const idempotencyKey = util.generateIdempotencyKey({
      customerId,
      amount,
    });
    const existing = this.#find(paymentsDatabase, idempotencyKey);
    if (existing) return existing;

    const result = await this.paymentGateway.pay({
      idempotencyKey,
      customerId,
      amount,
    });
    paymentsDatabase.push(result);
    return Promise.resolve(result);
  }

  refund({ paymentId }) {
    // We don't need to use idempotency keys here because
    // the gateway will only perform a refund once for a
    // given payment ID. But we should check for error codes
    // to return a successful result if the refund has
    // already been performed.
    return this.paymentGateway.refund({ paymentId });
  }

  async sendMoneyUsingPix({ amount, pixKey }) {
    const idempotencyKey = util.generateIdempotencyKey({ amount, pixKey });
    const existing = this.#find(pixDatabase, idempotencyKey);
    if (existing) return existing;

    const result = await this.paymentGateway.sendMoneyUsingPix({
      amount,
      pixKey,
    });
    pixDatabase.push(result);
    return Promise.resolve(result);
  }

  #find(database, idempotencyKey) {
    return database.find((record) => record.idempotencyKey === idempotencyKey);
  }
}
