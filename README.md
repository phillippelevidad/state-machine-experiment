# State Machine Experiment

## Overview

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
