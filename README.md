# Substrate TCR UI

![tcr-ui-screenshot](./img/tcr-ui.png)

Simple frontend for the [substrate TCR](https://github.com/gautamdhameja/substrate-tcr) runtime. This is a react.js app, bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

This app interacts with the Substrate TCR runtime using the [Polkadot JS API](https://github.com/polkadot-js/api) javascript client library.

## Usage

1. Run a local Substrate node with [Substrate-TCR](https://github.com/gautamdhameja/substrate-tcr) runtime.
1. Clone this repo.
1. Run `npm install` inside the directory where you have cloned this repo.
1. Run `npm start`. The UI should automatically connect to the local Substrate node.

**Note**: This UI currently does not support the initialization of the TCR and transfer of tokens. These functions can be called from the Polkadot Apps UI as described [here](https://github.com/gautamdhameja/substrate-tcr/wiki/How-to-test-the-TCR-runtime-using-Polkadot-Apps-Portal#step-1-initialize-the-tcr). Make sure to use the same account seeds in both places.