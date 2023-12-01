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
        entry: [
          assign({
            lastUpdated: () => Date.now(),
            currentState: "starting",
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
        entry: [
          assign({
            lastUpdated: () => Date.now(),
            currentState: "processingPayment",
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
        entry: [
          assign({
            lastUpdated: () => Date.now(),
            currentState: "exchangingCrypto",
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
      cryptoExchanged: {
        always: "processingWithdraw",
        entry: [
          assign({
            lastUpdated: () => Date.now(),
            currentState: "cryptoExchanged",
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
        entry: [
          assign({
            lastUpdated: () => Date.now(),
            currentState: "processingWithdraw",
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
      withdrawProcessed: {
        always: "succeeded",
        entry: [
          assign({
            lastUpdated: () => Date.now(),
            currentState: "withdrawProcessed",
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
        entry: [
          assign({
            lastUpdated: () => Date.now(),
            currentState: "paymentFailed",
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
        entry: [
          assign({
            lastUpdated: () => Date.now(),
            currentState: "cryptoFailed",
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
        entry: [
          assign({
            lastUpdated: () => Date.now(),
            currentState: "withdrawFailed",
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
        entry: [
          assign({
            lastUpdated: () => Date.now(),
            currentState: "succeeded",
            stateHistory: (context) => [...context.stateHistory, "succeeded"],
          }),
        ],
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
        entry: [
          assign({
            lastUpdated: () => Date.now(),
            currentState: "failedWithSuccessfulRollback",
            stateHistory: (context) => [
              ...context.stateHistory,
              "failedWithSuccessfulRollback",
            ],
          }),
        ],
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
        entry: [
          assign({
            lastUpdated: () => Date.now(),
            currentState: "failedPendingReview",
            stateHistory: (context) => [
              ...context.stateHistory,
              "failedPendingReview",
            ],
          }),
        ],
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
