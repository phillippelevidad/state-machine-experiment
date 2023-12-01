import { PaymentGateway } from "../PaymentGateway.js";

// This class decorates the PaymentGateway class with retry logic.
// The retry logic that is implemented here is very simple and naive.
// It is just for illustration purposes. The main takeaway is that
// the PaymentGatewayWithRetries class is not aware of the details
// of the PaymentGateway class, just as the PaymentGateway class
// is not aware of the details of the PaymentGatewayWithRetries class.
// This is the essence of the Decorator pattern, and it promotes both
// the Single Responsibility and the Open/Closed Principles.
// ----------

export class PaymentGatewayWithRetries extends PaymentGateway {
  static RETRY_COUNT = 2;

  constructor({ paymentGateway }) {
    super({});
    this.paymentGateway = paymentGateway;
  }

  pay({ customerId, amount }) {
    return this.#retryRecursive(
      () => this.paymentGateway.pay({ customerId, amount }),
      PaymentGatewayWithRetries.RETRY_COUNT
    );
  }

  refund({ paymentId }) {
    return this.#retryRecursive(
      () => this.paymentGateway.refund({ paymentId }),
      PaymentGatewayWithRetries.RETRY_COUNT
    );
  }

  sendMoneyUsingPix({ amount, pixKey }) {
    return this.#retryRecursive(
      () => this.paymentGateway.sendMoneyUsingPix({ amount, pixKey }),
      PaymentGatewayWithRetries.RETRY_COUNT
    );
  }

  #retryRecursive(action, retries) {
    return action().catch((error) => {
      if (error?.code === "timeout" && retries > 0) {
        return this.#retryRecursive(action, retries - 1);
      }
      throw error;
    });
  }
}
