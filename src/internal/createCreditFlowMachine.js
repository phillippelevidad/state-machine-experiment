import { assign, createMachine } from "xstate";

export function createCreditFlowMachine({
  start,
  processPayment,
  exchangeCrypto,
  processWithdraw,
  rollbackFromPaymentFailure,
  rollbackFromCryptoFailure,
  rollbackFromWithdrawFailure,
  onSuccess,
  onFailure,
}) {
  return createMachine({
    predictableActionArguments: true,
    id: "creditFlow",
    context: {
      userId: "",
      amount: 0,
      isSuccess: false,
      isError: false,
      error: null,
      currentState: "",
      stateHistory: [],
      lastUpdated: Date.now(),
    },
    initial: "idle",
    states: {
      idle: {
        on: {
          START: {
            target: "starting",
            actions: assign((context, event) => ({
              userId: event.data.userId,
              amount: event.data.amount,
            })),
          },
        },
      },
      starting: {
        ...invokeFor("starting", {
          action: start,
          onDone: "processingPayment",
          onError: "failedWithSuccessfulRollback",
        }),
        ...entryAndExitActionsFor("starting"),
      },
      processingPayment: {
        ...invokeFor("processingPayment", {
          action: processPayment,
          onDone: "paymentProcessed",
          onError: "paymentFailed",
        }),
        ...entryAndExitActionsFor("processingPayment"),
      },
      paymentProcessed: {
        always: "exchangingCrypto",
        ...entryAndExitActionsFor("paymentProcessed"),
      },
      exchangingCrypto: {
        ...invokeFor("exchangingCrypto", {
          action: exchangeCrypto,
          onDone: "cryptoExchanged",
          onError: "cryptoFailed",
        }),
        ...entryAndExitActionsFor("exchangingCrypto"),
      },
      cryptoExchanged: {
        always: "processingWithdraw",
        ...entryAndExitActionsFor("cryptoExchanged"),
      },
      processingWithdraw: {
        ...invokeFor("processingWithdraw", {
          action: processWithdraw,
          onDone: "withdrawProcessed",
          onError: "withdrawFailed",
        }),
        ...entryAndExitActionsFor("processingWithdraw"),
      },
      withdrawProcessed: {
        always: "succeeded",
        ...entryAndExitActionsFor("withdrawProcessed"),
      },
      paymentFailed: {
        ...invokeFor("paymentFailed", {
          action: rollbackFromPaymentFailure,
          onDone: "failedWithSuccessfulRollback",
          onError: "failedPendingReview",
        }),
        ...entryAndExitActionsFor("paymentFailed"),
      },
      cryptoFailed: {
        ...invokeFor("cryptoFailed", {
          action: rollbackFromCryptoFailure,
          onDone: "failedWithSuccessfulRollback",
          onError: "failedPendingReview",
        }),
        ...entryAndExitActionsFor("cryptoFailed"),
      },
      withdrawFailed: {
        ...invokeFor("withdrawFailed", {
          action: rollbackFromWithdrawFailure,
          onDone: "failedWithSuccessfulRollback",
          onError: "failedPendingReview",
        }),
        ...entryAndExitActionsFor("withdrawFailed"),
      },
      succeeded: {
        type: "final",
        ...invokeFor("succeeded", {
          action: onSuccess,
          onError: "failedPendingReview",
        }),
        ...entryActionForFinal("succeeded"),
      },
      failedWithSuccessfulRollback: {
        type: "final",
        ...invokeFor("failedWithSuccessfulRollback", {
          action: onFailure,
          onError: "failedPendingReview",
        }),
        ...entryActionForFinal("failedWithSuccessfulRollback"),
      },
      failedPendingReview: {
        type: "final",
        ...invokeFor("failedPendingReview", {
          action: onFailure,
        }),
        ...entryActionForFinal("failedPendingReview"),
      },
    },
  });
}

function invokeFor(state, { action, onDone, onError }) {
  return {
    invoke: {
      id: state,
      src: (context, event) => callHandlerWithContext(action, context, event),
      onDone: {
        target: onDone,
        actions: assign((context, event) => ({ ...event.data })),
      },
      onError: {
        target: onError,
        actions: assign((context, event) => ({ error: event.data })),
      },
    },
  };
}

function callHandlerWithContext(handler, context, event) {
  const isError = context.currentState.includes("failed");
  return handler?.({
    ...context,
    ...event,
    isError,
    isSuccess: context.currentState.includes("succeeded"),
    error: isError ? context.error ?? event.data ?? "Unknown error" : null,
  });
}

function entryAndExitActionsFor(state) {
  return {
    entry: [
      assign({
        lastUpdated: () => Date.now(),
        currentState: state,
      }),
    ],
    exit: [
      assign({
        lastUpdated: () => Date.now(),
        stateHistory: (context) => [
          ...context.stateHistory,
          context.currentState,
        ],
      }),
    ],
  };
}

function entryActionForFinal(state) {
  return {
    entry: [
      assign({
        lastUpdated: () => Date.now(),
        currentState: state,
        stateHistory: (context) => [...context.stateHistory, state],
      }),
    ],
  };
}
