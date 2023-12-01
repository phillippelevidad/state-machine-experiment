import { describe, it } from "mocha";
import { expect } from "chai";
import { CreditFlowActions } from "../src/CreditFlowActions.js";
import { CreditFlow } from "../src/CreditFlow.js";
import { Database } from "../src/Database.js";
import { PaymentGateway } from "../src/PaymentGateway.js";
import { CryptoGateway } from "../src/CryptoGateway.js";

describe("CreditFlow", () => {
  describe("run", () => {
    it("successfully executes the whole flow and returns the expected object shape", async () => {
      const actions = new CreditFlowActions({
        database: new Database(),
        paymentGateway: new PaymentGateway(),
        cryptoGateway: new CryptoGateway(),
      });
      const flow = new CreditFlow({
        actions,
      });
      const data = { userId: "some-user-id", amount: 100 };
      const expected = {
        userId: "some-user-id",
        amount: 100,
        isSuccess: true,
        isError: false,
        error: null,
        currentState: "succeeded",
        stateHistory: [
          "starting",
          "processingPayment",
          "paymentProcessed",
          "exchangingCrypto",
          "cryptoExchanged",
          "processingWithdraw",
          "withdrawProcessed",
          "succeeded",
        ],
        lastUpdated: 1701436761496,
        userInfo: {
          userId: "some-user-id",
          name: "John Doe",
          email: "john.doe@example.com",
          gatewayCustomerId: "some-customer-id",
          pixKey: "some-pix-key",
        },
        transactionId: "some-transaction-id",
        payment: {
          idempotencyKey:
            "efcbc76b75a81c417b67e621a2f0db692a82aa1c44ff5ec37864333095dcf20b",
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
        withdraw: {
          idempotencyKey:
            "7880f8c0e2f77b5f10627b15ce3db57503c10f2af9d0c67522729650dac6af5e",
          pixKey: "some-pix-key",
          amount: 100,
          pixId: "some-pix-id",
          status: "success",
        },
      };
      const result = await flow.run(data);
      expect(objectsHaveSameStructure(result, expected)).to.be.true;
    });
  });
});

function objectsHaveSameStructure(obj1, obj2) {
  // Compare if both are objects and have the same keys
  if (
    typeof obj1 === "object" &&
    typeof obj2 === "object" &&
    obj1 !== null &&
    obj2 !== null
  ) {
    const keys1 = Object.keys(obj1).sort();
    const keys2 = Object.keys(obj2).sort();

    if (
      keys1.length !== keys2.length ||
      !keys1.every((key, idx) => key === keys2[idx])
    ) {
      return false;
    }

    // Recursively compare the structure of all values
    return keys1.every((key) => objectsHaveSameStructure(obj1[key], obj2[key]));
  }

  // If they are not objects (or one of them is null), consider them as having the same structure
  return true;
}
