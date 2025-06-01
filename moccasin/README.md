# Moccasin Portfolio Fund Me Contracts

[![Vyper](https://img.shields.io/badge/Vyper-0.4.1-blue.svg)](https://vyper.readthedocs.io/en/stable/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📖 Overview

This repository contains the Vyper smart contracts for the **Portfolio Fund Me** project. The primary contract, `FundMe`, enables users to fund a portfolio using **Ether (ETH)** and a designated **ZK token**.

The contract includes robust mechanisms for managing funds, such as reentrancy guards and strict access controls for withdrawals, ensuring the security and integrity of the pooled assets. A mock ZK token is provided for isolated testing and development environments.

---

## 🔎 Audit Scope

The following contracts and their respective pragma versions are within the scope of this audit:

- **`fund_me.vy`**:
  - **Description**: The core contract responsible for receiving ETH and ZK tokens from funders and allowing the owner to withdraw them. It integrates `snekmate.auth.ownable` for access control.
  - **Pragma Version**: `0.4.1`
- **`mocks/mock_zk_token.vy`**:
  - **Description**: A mock ERC20 token implementation used solely for testing purposes. It allows for the simulation of ZK token transfers and approvals without relying on a deployed ZK token on a testnet or mainnet.
  - **Pragma Version**: `0.4.1`

**Key areas for review within `fund_me.vy` include:**

- **Funding Mechanisms**: `fund_eth()` and `fund_zk_token()`.
- **Withdrawal Mechanisms**: `withdraw_eth()` and `withdraw_zk_token()`.
- **Access Control**: Ensure `ownable` module integration is secure and `_check_owner()` is correctly applied.
- **Reentrancy Guards**: Verify the effectiveness of `@nonreentrant` decorator on all state-changing external functions.
- **Token Handling**: Correctness of `IERC20` interface calls (`transferFrom`, `transfer`) and `raw_call` for ETH.
- **Error Handling**: Robustness of `assert` statements and custom error messages.
- **State Management**: Accuracy of `balance_of_eth`, `balance_of_zk_token`, `funder_count`, `funder_to_eth_funded`, and `funder_to_zk_funded`.

---

## 🚀 Getting Started

This project uses `moccasin` for Vyper development, compilation, and testing.

### Prerequisites

Ensure you have the following installed on your system:

- [uv](https://docs.astral.sh/uv/): An extremely fast Python package and project manager, written in Rust.

### Installation

**After cloning the repository, navigate to the project directory and run:**

```bash
uv venv
uv sync
source .venv/bin/activate
```

This will create a virtual environment and install all necessary dependencies specified in the `pyproject.toml` file.

Then check that `moccasin` is installed correctly by running:

```bash
mox --version
```

### Compilation

To compile the contracts, navigate to the root of the project directory and run:

```bash
mox compile
```

This command will compile all `.vy` files in the current directory and its subdirectories (like `mocks/`). The compiled artifacts (ABIs and bytecode) will be generated in a `out/` directory within your project root.

## 🧪 Running Tests

Unit and integration tests for the contracts are located in the `tests/` directory. These tests are written in Python and utilize moccasin's testing framework (powered by [Titanoboa](https://titanoboa.readthedocs.io/en/latest/)).

To run all tests, execute the following command from the project root:

```bash
moccasin test
```

## &#x1F3AF; To Do

- [ ] Implement invariant testing with Hypothesis.
- [ ] Add integration tests for the `FundMe` contract if necessary.
- [ ] Try to deploy the contract to a testnet (e.g., Sepolia) and interact with it using a frontend.
- [ ] Try to test on a fork.
