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
      // The machine starts in the idle state.
      // Upon receiving the START event, it stores the userId and amount
      // in the context and then it transitions automatically to the starting state.
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
      // The starting state invokes the start action.
      // If the action succeeds, it transitions to the processingPayment state.
      // If the action fails, it transitions to the failedWithSuccessfulRollback state.
      // Every state has an entry and exit action that updates the context with the current state.
      starting: {
        ...invokeFor("starting", {
          action: start,
          onDone: "processingPayment",
          onError: "failedWithSuccessfulRollback",
        }),
        ...entryAndExitActionsFor("starting"),
      },
      // The processingPayment state invokes the processPayment action.
      // If the action succeeds, it transitions to the paymentProcessed state.
      // If the action fails, it transitions to the paymentFailed state.
      processingPayment: {
        ...invokeFor("processingPayment", {
          action: processPayment,
          onDone: "paymentProcessed",
          onError: "paymentFailed",
        }),
        ...entryAndExitActionsFor("processingPayment"),
      },
      // The paymentProcessed is meant to be a transient state,
      // so it doesn't invoke any action. Right after entering this state,
      // it transitions to the exchangingCrypto state.
      paymentProcessed: {
        always: "exchangingCrypto",
        ...entryAndExitActionsFor("paymentProcessed"),
      },
      // The exchangingCrypto state invokes the exchangeCrypto action.
      // If the action succeeds, it transitions to the cryptoExchanged state.
      // If the action fails, it transitions to the cryptoFailed state.
      exchangingCrypto: {
        ...invokeFor("exchangingCrypto", {
          action: exchangeCrypto,
          onDone: "cryptoExchanged",
          onError: "cryptoFailed",
        }),
        ...entryAndExitActionsFor("exchangingCrypto"),
      },
      // The cryptoExchanged is meant to be a transient state,
      // so it doesn't invoke any action. Right after entering this state,
      // it transitions to the processingWithdraw state.
      cryptoExchanged: {
        always: "processingWithdraw",
        ...entryAndExitActionsFor("cryptoExchanged"),
      },
      // The processingWithdraw state invokes the processWithdraw action.
      // If the action succeeds, it transitions to the withdrawProcessed state.
      // If the action fails, it transitions to the withdrawFailed state.
      processingWithdraw: {
        ...invokeFor("processingWithdraw", {
          action: processWithdraw,
          onDone: "withdrawProcessed",
          onError: "withdrawFailed",
        }),
        ...entryAndExitActionsFor("processingWithdraw"),
      },
      // The withdrawProcessed is meant to be a transient state,
      // so it doesn't invoke any action. Right after entering this state,
      // it transitions to the succeeded state.
      withdrawProcessed: {
        always: "succeeded",
        ...entryAndExitActionsFor("withdrawProcessed"),
      },
      // The paymentFailed state invokes the rollbackFromPaymentFailure action.
      // If the action succeeds, it transitions to the failedWithSuccessfulRollback state.
      // If the action fails, it transitions to the failedPendingReview state.
      paymentFailed: {
        ...invokeFor("paymentFailed", {
          action: rollbackFromPaymentFailure,
          onDone: "failedWithSuccessfulRollback",
          onError: "failedPendingReview",
        }),
        ...entryAndExitActionsFor("paymentFailed"),
      },
      // The cryptoFailed state invokes the rollbackFromCryptoFailure action.
      // If the action succeeds, it transitions to the failedWithSuccessfulRollback state.
      // If the action fails, it transitions to the failedPendingReview state.
      cryptoFailed: {
        ...invokeFor("cryptoFailed", {
          action: rollbackFromCryptoFailure,
          onDone: "failedWithSuccessfulRollback",
          onError: "failedPendingReview",
        }),
        ...entryAndExitActionsFor("cryptoFailed"),
      },
      // The withdrawFailed state invokes the rollbackFromWithdrawFailure action.
      // If the action succeeds, it transitions to the failedWithSuccessfulRollback state.
      // If the action fails, it transitions to the failedPendingReview state.
      withdrawFailed: {
        ...invokeFor("withdrawFailed", {
          action: rollbackFromWithdrawFailure,
          onDone: "failedWithSuccessfulRollback",
          onError: "failedPendingReview",
        }),
        ...entryAndExitActionsFor("withdrawFailed"),
      },
      // The succeeded state invokes the onSuccess action.
      // This is a final state, so it doesn't transition to any other state,
      // unless there is an error in the onSuccess action, in which case
      // it transitions to the failedPendingReview state.
      succeeded: {
        type: "final",
        ...invokeFor("succeeded", {
          action: onSuccess,
          onError: "failedPendingReview",
        }),
        ...entryActionForFinal("succeeded"),
      },
      // The failedWithSuccessfulRollback state invokes the onFailure action.
      // This is a final state, so it doesn't transition to any other state,
      // unless there is an error in the onFailure action, in which case
      // it transitions to the failedPendingReview state.
      failedWithSuccessfulRollback: {
        type: "final",
        ...invokeFor("failedWithSuccessfulRollback", {
          action: onFailure,
          onError: "failedPendingReview",
        }),
        ...entryActionForFinal("failedWithSuccessfulRollback"),
      },
      // The failedPendingReview state invokes the onFailure action.
      // This is a final state, so it doesn't transition to any other state.
      // It is meant to be a state where a human can review the error and
      // decide what to do next.
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
  // eslint-disable-next-line no-unused-vars
  const { type, ...eventWithoutType } = event;
  return handler?.({
    ...context,
    ...eventWithoutType,
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
