import util from "./util.js";

export class Database {
  getUserInfo({ userId }) {
    return util.simulateAsyncOperation(() => ({
      userId,
      name: "John Doe",
      email: "john.doe@example.com",
      gatewayCustomerId: "some-customer-id",
      pixKey: "some-pix-key",
    }));
  }

  registerCreditTransaction(details) {
    return util.simulateAsyncOperation(() => ({
      ...details,
      id: "some-transaction-id",
    }));
  }

  updateCreditTransaction(id, details) {
    return util.simulateAsyncOperation(() => ({
      ...details,
      id,
    }));
  }
}
