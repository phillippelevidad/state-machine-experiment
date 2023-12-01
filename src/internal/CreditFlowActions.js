import { log } from "../logger.js";

export class CreditFlowActions {
  constructor({ database, paymentGateway, cryptoGateway }) {
    this.database = database;
    this.paymentGateway = paymentGateway;
    this.cryptoGateway = cryptoGateway;
  }

  async start(context) {
    const userInfo = await this.database.getUserInfo({
      userId: context.userId,
    });
    const transaction = await this.database.registerCreditTransaction({
      userId: context.userId,
      amount: context.amount,
    });
    return { userInfo, transactionId: transaction.id };
  }

  async processPayment(context) {
    const result = await this.paymentGateway.pay({
      customerId: context.userInfo.gatewayCustomerId,
      amount: context.amount,
    });
    await this.database.updateCreditTransaction(context.transactionId, {
      payment: result,
    });
    return { payment: result };
  }

  async exchangeCrypto(context) {
    const cryptoPurchase = await this.#purchaseCrypto(context);
    const cryptoSale = await this.#sellCrypto(context, cryptoPurchase);
    return { cryptoPurchase, cryptoSale };
  }

  async #purchaseCrypto(context) {
    const result = this.cryptoGateway.purchaseCrypto({
      cryptoKey: "BTC",
      fundsAmount: context.amount,
    });
    await this.database.updateCreditTransaction(context.transactionId, {
      cryptoPurchase: result,
    });
    return result;
  }

  async #sellCrypto(context, cryptoPurchase) {
    const result = this.cryptoGateway.sellCrypto({
      cryptoKey: cryptoPurchase.cryptoKey,
      cryptoAmount: cryptoPurchase.cryptoAmount,
    });
    await this.database.updateCreditTransaction(context.transactionId, {
      cryptoSale: result,
    });
    return result;
  }

  async processWithdraw(context) {
    const result = await this.paymentGateway.sendMoneyUsingPix({
      amount: context.amount,
      pixKey: context.userInfo.pixKey,
    });
    await this.database.updateCreditTransaction(context.transactionId, {
      withdraw: result,
    });
    return { withdraw: result };
  }

  rollbackFromPaymentFailure(context) {
    this.database.updateCreditTransaction(context.transactionId, {
      rollbackPayment: "success",
    });
  }

  async rollbackFromCryptoFailure(context) {
    const refundResult = await this.paymentGateway.refund({
      paymentId: context.payment.paymentId,
    });
    await this.database.updateCreditTransaction(context.transactionId, {
      rollbackCrypto: "success",
    });
    const rollbackResult = await this.rollbackFromPaymentFailure(context);
    return { refund: refundResult, ...rollbackResult };
  }

  async rollbackFromWithdrawFailure(context) {
    await this.database.updateCreditTransaction(context.transactionId, {
      rollbackWithdraw: "success",
    });
    return this.rollbackFromCryptoFailure(context);
  }

  onSuccess(context) {
    log.debug(context);
    this.database.updateCreditTransaction(context.transactionId, {
      overallStatus: "success",
    });
  }

  onFailure(context) {
    log.error(context.error);
    this.database.updateCreditTransaction(context.transactionId, {
      overallStatus: "failure",
    });
  }
}
