import { interpret } from "xstate";
import { createCreditFlowMachine } from "./internal/createCreditFlowMachine.js";

export class CreditFlow {
  constructor({ actions }) {
    this.actions = actions;
  }

  async run({ userId, amount }) {
    return new Promise((resolve, reject) => {
      const machine = createCreditFlowMachine({
        start: (context) => this.actions.start(context),
        processPayment: (context) => this.actions.processPayment(context),
        exchangeCrypto: (context) => this.actions.exchangeCrypto(context),
        processWithdraw: (context) => this.actions.processWithdraw(context),
        rollbackFromPaymentFailure: (context) =>
          this.actions.rollbackFromPaymentFailure(context),
        rollbackFromCryptoFailure: (context) =>
          this.actions.rollbackFromCryptoFailure(context),
        rollbackFromWithdrawFailure: (context) =>
          this.actions.rollbackFromWithdrawFailure(context),
        onSuccess: (context) => {
          this.actions.onSuccess(context);
          resolve(context);
        },
        onFailure: (context) => {
          this.actions.onFailure(context);
          reject(context);
        },
      });
      const service = interpret(machine);
      service.start().send({ type: "START", data: { userId, amount } });
    });
  }
}
