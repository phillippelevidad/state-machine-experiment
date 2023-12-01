import util from "./util.js";

const FUNDS_TO_CRYPTO_RATE = 0.0001;
const CRYPTO_TO_FUNDS_RATE = 10_000;

export class CryptoGateway {
  purchaseCrypto({ cryptoKey, fundsAmount }) {
    return util.simulateAsyncOperation(() => ({
      cryptoKey,
      fundsAmount,
      cryptoAmount: fundsAmount * FUNDS_TO_CRYPTO_RATE,
      status: "success",
    }));
  }

  sellCrypto({ cryptoKey, cryptoAmount }) {
    return util.simulateAsyncOperation(() => ({
      cryptoKey,
      cryptoAmount,
      fundsAmount: cryptoAmount * CRYPTO_TO_FUNDS_RATE,
      status: "success",
    }));
  }
}
