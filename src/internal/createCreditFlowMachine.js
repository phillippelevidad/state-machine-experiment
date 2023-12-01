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
        invoke: {
          id: "starting",
          src: (context, event) =>
            callHandlerWithContext(start, context, event),
          onDone: {
            target: "processingPayment",
            actions: assign((context, event) => ({ ...event.data })),
          },
          onError: {
            target: "failedWithSuccessfulRollback",
            actions: assign((context, event) => ({ error: event.data })),
          },
        },
        ...entryAndExitActionsFor("starting"),
      },
      processingPayment: {
        invoke: {
          id: "processingPayment",
          src: (context, event) =>
            callHandlerWithContext(processPayment, context, event),
          onDone: {
            target: "paymentProcessed",
            actions: assign((context, event) => ({ ...event.data })),
          },
          onError: {
            target: "paymentFailed",
            actions: assign((context, event) => ({ error: event.data })),
          },
        },
        ...entryAndExitActionsFor("processingPayment"),
      },
      paymentProcessed: {
        always: "exchangingCrypto",
        entry: [
          assign({
            lastUpdated: () => Date.now(),
            currentState: "paymentProcessed",
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
      },
      exchangingCrypto: {
        invoke: {
          id: "exchangingCrypto",
          src: (context, event) =>
            callHandlerWithContext(exchangeCrypto, context, event),
          onDone: {
            target: "cryptoExchanged",
            actions: assign((context, event) => ({ ...event.data })),
          },
          onError: {
            target: "cryptoFailed",
            actions: assign((context, event) => ({ error: event.data })),
          },
        },
        ...entryAndExitActionsFor("exchangingCrypto"),
      },
      cryptoExchanged: {
        always: "processingWithdraw",
        ...entryAndExitActionsFor("cryptoExchanged"),
      },
      processingWithdraw: {
        invoke: {
          id: "processingWithdraw",
          src: (context, event) =>
            callHandlerWithContext(processWithdraw, context, event),
          onDone: {
            target: "withdrawProcessed",
            actions: assign((context, event) => ({ ...event.data })),
          },
          onError: {
            target: "withdrawFailed",
            actions: assign((context, event) => ({ error: event.data })),
          },
        },
        ...entryAndExitActionsFor("processingWithdraw"),
      },
      withdrawProcessed: {
        always: "succeeded",
        ...entryAndExitActionsFor("withdrawProcessed"),
      },
      paymentFailed: {
        invoke: {
          id: "paymentFailed",
          src: (context, event) =>
            callHandlerWithContext(rollbackFromPaymentFailure, context, event),
          onDone: {
            target: "failedWithSuccessfulRollback",
            actions: assign((context, event) => ({ ...event.data })),
          },
          onError: {
            target: "failedPendingReview",
            actions: assign((context, event) => ({ error: event.data })),
          },
        },
        ...entryAndExitActionsFor("paymentFailed"),
      },
      cryptoFailed: {
        invoke: {
          id: "cryptoFailed",
          src: (context, event) =>
            callHandlerWithContext(rollbackFromCryptoFailure, context, event),
          onDone: {
            target: "failedWithSuccessfulRollback",
            actions: assign((context, event) => ({ ...event.data })),
          },
          onError: {
            target: "failedPendingReview",
            actions: assign((context, event) => ({ error: event.data })),
          },
        },
        ...entryAndExitActionsFor("cryptoFailed"),
      },
      withdrawFailed: {
        invoke: {
          id: "withdrawFailed",
          src: (context, event) =>
            callHandlerWithContext(rollbackFromWithdrawFailure, context, event),
          onDone: {
            target: "failedWithSuccessfulRollback",
            actions: assign((context, event) => ({ ...event.data })),
          },
          onError: {
            target: "failedPendingReview",
            actions: assign((context, event) => ({ error: event.data })),
          },
        },
        ...entryAndExitActionsFor("withdrawFailed"),
      },
      succeeded: {
        type: "final",
        invoke: {
          id: "succeeded",
          src: (context, event) =>
            callHandlerWithContext(onSuccess, context, event),
          onDone: {
            actions: assign((context, event) => ({ ...event.data })),
          },
          onError: {
            target: "failedPendingReview",
            actions: assign((context, event) => ({ error: event.data })),
          },
        },
        ...entryActionForFinal("succeeded"),
      },
      failedWithSuccessfulRollback: {
        type: "final",
        invoke: {
          id: "failedWithSuccessfulRollback",
          src: (context, event) =>
            callHandlerWithContext(onFailure, context, event),
          onDone: {
            actions: assign((context, event) => ({ ...event.data })),
          },
          onError: {
            target: "failedPendingReview",
            actions: assign((context, event) => ({ error: event.data })),
          },
        },
        ...entryActionForFinal("failedWithSuccessfulRollback"),
      },
      failedPendingReview: {
        type: "final",
        invoke: {
          id: "failedPendingReview",
          src: (context, event) =>
            callHandlerWithContext(onFailure, context, event),
          onDone: {
            actions: assign((context, event) => ({ ...event.data })),
          },
          onError: {
            actions: assign((context, event) => ({ error: event.data })),
          },
        },
        ...entryActionForFinal("failedPendingReview"),
      },
    },
  });
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

function entryAndExitActionsFor(stateName) {
  return {
    entry: [
      assign({
        lastUpdated: () => Date.now(),
        currentState: stateName,
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

function entryActionForFinal(stateName) {
  return {
    entry: [
      assign({
        lastUpdated: () => Date.now(),
        currentState: stateName,
        stateHistory: (context) => [...context.stateHistory, stateName],
      }),
    ],
  };
}
