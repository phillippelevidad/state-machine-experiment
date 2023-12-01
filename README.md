# State Machine Experiment

This repository demonstrates the use of a state machine to control a complex purchase flow involving retries and rollback actions. It's designed to showcase best practices in software design and architecture, particularly in the context of handling intricate business logic and transaction flows.

## Installation

To set up the project locally, follow these steps:

```bash
git clone https://github.com/phillippelevidad/state-machine-experiment.git
cd state-machine-experiment
npm install
```

## Running Tests

To run the tests and verify the functionality:

```bash
npm run test
```

## Navigating the Code

Start exploring the code from the `CreditFlow` class located in the `src/CreditFlow.js` file. This class is central to the state machine implementation and orchestrates the purchase flow.

## Usage

Refer to the `CreditFlow.test.js` file in the test directory for examples on how to use the `CreditFlow` class. This file one integration test demonstrating how to setup and run the purchase flow.

The main two classes here are `CreditFlow` and `CreditFlowActions`. Also, the state machine definition, which resides in the `src/internal/createCreditFlowMachine.js` file.

## SOLID Practices

The codebase adheres to SOLID principles:

- **Single Responsibility Principle**: Each class and method has a single responsibility and purpose, enhancing maintainability and scalability.
- **Open/Closed Principle**: Classes are open for extension but closed for modification, demonstrated through the use of state machine design that allows adding new states without altering existing code.
- **Liskov Substitution Principle**: The code structure allows for derived classes to be substitutable for their base classes.
- **Interface Segregation Principle**: Interfaces are specific to client requirements, ensuring that clients only need to know about the methods that are of interest to them.
- **Dependency Inversion Principle**: High-level modules do not depend on low-level modules but on abstractions.

## Design Patterns

### Decorator Pattern

The Decorator design pattern is used to extend the functionality of objects dynamically. This is evident in files like `PaymentGatewayWithRetries.js` and `PaymentGatewayWithIdempotency.js` in the internal directory. These decorators add additional behaviors (like retries and idempotency checks) to the basic payment gateway functionality without modifying the original `PaymentGateway` class.

## The XState package

XState is a library for creating, interpreting, and executing finite state machines and statecharts.

This package is central to the project, as it is used to implement the state machine logic that controls the complex purchase flow. The `CreditFlow` class and other components utilize XState to manage states, transitions, and side-effects within the purchase process.

https://github.com/statelyai/xstate

## Conclusion

This repository serves as a practical example of implementing complex business logic using state machines, adhering to SOLID principles, and effectively utilizing design patterns such as Decorator to enhance functionality.

---

## Tests

```
  CreditFlow
    run
      ✔ successfully executes the whole flow

  createCreditFlowMachine
    ✔ returns a machine

  creditFlowMachine
    ✔ reaches the `succeeded` state if no errors
    ✔ invokes all callback functions for the happy path
    ✔ invokes the `onFailure` callback for any errors
    ✔ reaches the `failedWithSuccessfulRollback` state for a failure with successful rollback
    ✔ reaches the `failedPendingReview` state for a failure with a failed rollback
    ✔ invokes the `rollbackFromPaymentFailure` callback for a payment failure
    ✔ invokes the `rollbackFromCryptoFailure` callback for a crypto failure
    ✔ invokes the `rollbackFromWithdrawFailure` callback for a withdraw failure

  CreditFlowActions
    start
      ✔ registers a new credit transaction
      ✔ returns userInfo and transactionId
    processPayment
      ✔ pays using payment gateway
      ✔ updates transaction with payment result
    exchangeCrypto
      ✔ purchases crypto
      ✔ sells crypto
      ✔ updates transaction with crypto purchase and sale results
    processWithdraw
      ✔ sends money using pix
      ✔ updates transaction with withdraw result
    rollbackFromPaymentFailure
      ✔ updates transaction with the rollback result
    rollbackFromCryptoFailure
      ✔ refunds payment
      ✔ updates transaction with the rollback result
      ✔ calls rollbackFromPaymentFailure
    rollbackFromWithdrawFailure
      ✔ updates transaction with the rollback result
      ✔ calls rollbackFromCryptoFailure
    onSuccess
      ✔ updates transaction with the transaction result
    onFailure
      ✔ updates transaction with the transaction result

  CreditFlowActionsWithLogging
    start
      ✔ calls the credit flow actions' start method
    processPayment
      ✔ calls the credit flow actions' processPayment method
    exchangeCrypto
      ✔ calls the credit flow actions' exchangeCrypto method
    processWithdraw
      ✔ calls the credit flow actions' processWithdraw method
    rollbackFromPaymentFailure
      ✔ calls the credit flow actions' rollbackFromPaymentFailure method
    rollbackFromCryptoFailure
      ✔ calls the credit flow actions' rollbackFromCryptoFailure method
    rollbackFromWithdrawFailure
      ✔ calls the credit flow actions' rollbackFromWithdrawFailure method
    onSuccess
      ✔ calls the credit flow actions' onSuccess method
    onFailure
      ✔ calls the credit flow actions' onFailure method

  PaymentGatewayWithIdempotency
    pay
      ✔ calls the payment gateway's pay method
      ✔ does not call the payment gateway's pay method twice for the same parameters
      ✔ calls the payment gateway's pay method twice for different parameters
    refund
      ✔ calls the payment gateway's refund method
    sendMoneyUsingPix
      ✔ calls the payment gateway's sendMoneyUsingPix method
      ✔ does not call the payment gateway's sendMoneyUsingPix method twice for the same parameters
      ✔ calls the payment gateway's sendMoneyUsingPix method twice for different parameters

  PaymentGatewayWithRetries
    pay
      ✔ calls the payment gateway's pay method
    refund
      ✔ calls the payment gateway's refund method
    sendMoneyUsingPix
      ✔ calls the payment gateway's sendMoneyUsingPix method

  util
    simulateAsyncOperation
      ✔ returns a promise
      ✔ resolves with the return value of the success callback
      ✔ rejects with the return value of the error callback
    generateIdempotencyKey
      ✔ returns a string
      ✔ returns a different key for different objects
      ✔ returns the same key for the same object
      ✔ returns the same key for the same object with different key order
```
