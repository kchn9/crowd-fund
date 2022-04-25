
# Crowdfunding Smart Contract

![](https://github.com/Developer-DAO/ukraine-donation-nft/actions/workflows/continuous-integration.yaml/badge.svg)

This project is representation of simple mechanism of crowdfunding services - allows anybody create CrowdFund.sol contract and collect money for any goal.

When fundraising phase is over then users can withdraw their funds if goal is not reached, otherwise funds are sent to presetted receiver.


## Features

- Events keep track of current funding state
- Constructor creating new instance that presets all immutable variables (i.e. goal, duration and receiving address)
- Contract takes care to prevent unwanted re-executing
- Fallback receive() function to serve direct ETH transfers


## Created with (dependencies)

- Truffle v5.5.11 (core: 5.5.11)
- Ganache v^7.0.4
- Solidity - ^0.8.0 (solc-js)
- Node v16.14.2
- Web3.js v1.5.3
- [dotenv](github.com/motdotla/dotenv)
- [@openzeppelin/test-helpers](https://github.com/OpenZeppelin/openzeppelin-test-helpers) ^0.5.15
## Installation

Clone the crowd-funding

```bash
  git clone https://github.com/kchn9/crowd-fund.git
```

Go to the project directory

```bash
  cd crowd-fund
```

Install dependencies

```bash
  npm install
```
    
## Running Tests

To run tests, run the following command

```bash
  truffle test
```


## Lessons Learned

- deeper approach to TDD
- saving environment variables with dotenv
- testing with openzeppelin test-helpers (time-elapsed simulation, expecting events and reverts)
- in depth understanding of truffle migrations

## Authors

- [@kchn9](https://www.github.com/kchn9)


## License

[MIT](https://choosealicense.com/licenses/mit/)

