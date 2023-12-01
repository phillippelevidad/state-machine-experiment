import { log } from "../logger.js";
import { CreditFlowActions } from "../CreditFlowActions.js";

// Uses the Decorator design pattern to add logging
// capabilities to the credit flow actions. See the PaymentGatewayWithRetries
// class for more details about the Decorator pattern.
// ----------

export class CreditFlowActionsWithLogging extends CreditFlowActions {
  constructor({ creditFlowActions }) {
    super({});
    this.creditFlowActions = creditFlowActions;
  }

  async start(context) {
    return this.creditFlowActions
      .start(context)
      .then(() => log.debug({ context }, "Started credit flow"))
      .catch((error) =>
        log.error({ context, error }, "Failed to start credit flow")
      );
  }

  processPayment(context) {
    return this.creditFlowActions
      .processPayment(context)
      .then(() => log.debug({ context }, "Processed payment"))
      .catch((error) =>
        log.error({ context, error }, "Failed to process payment")
      );
  }

  exchangeCrypto(context) {
    return this.creditFlowActions
      .exchangeCrypto(context)
      .then(() => log.debug({ context }, "Exchanged crypto"))
      .catch((error) =>
        log.error({ context, error }, "Failed to exchange crypto")
      );
  }

  processWithdraw(context) {
    return this.creditFlowActions
      .processWithdraw(context)
      .then(() => log.debug({ context }, "Processed withdraw"))
      .catch((error) =>
        log.error({ context, error }, "Failed to process withdraw")
      );
  }

  rollbackFromPaymentFailure(context) {
    return this.creditFlowActions
      .rollbackFromPaymentFailure(context)
      .then(() => log.debug({ context }, "Rolled back from payment failure"))
      .catch((error) =>
        log.error({ context, error }, "Failed to rollback from payment failure")
      );
  }

  rollbackFromCryptoFailure(context) {
    return this.creditFlowActions
      .rollbackFromCryptoFailure(context)
      .then(() => log.debug({ context }, "Rolled back from crypto failure"))
      .catch((error) =>
        log.error({ context, error }, "Failed to rollback from crypto failure")
      );
  }

  rollbackFromWithdrawFailure(context) {
    return this.creditFlowActions
      .rollbackFromWithdrawFailure(context)
      .then(() => log.debug({ context }, "Rolled back from withdraw failure"))
      .catch((error) =>
        log.error(
          { context, error },
          "Failed to rollback from withdraw failure"
        )
      );
  }

  onSuccess(context) {
    return this.creditFlowActions
      .onSuccess(context)
      .then(() => log.debug({ context }, "Credit flow succeeded"))
      .catch((error) =>
        log.error({ context, error }, "Failed to succeed credit flow")
      );
  }

  onFailure(error, context) {
    return this.creditFlowActions
      .onFailure(error)
      .then(() => log.debug({ context }, "Credit flow failed"))
      .catch((error) =>
        log.error({ error, context }, "Failed to fail credit flow")
      );
  }
}
