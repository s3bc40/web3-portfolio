import pytest

from moccasin.boa_tools import VyperContract
from script import deploy_fund_me
from script.mocks import deploy_mock_erc20


@pytest.fixture(scope="session")
def mock_erc20() -> VyperContract:
    """
    Fixture to provide a MockERC20 contract instance for testing.
    Deploys the MockERC20 contract.
    """
    return deploy_mock_erc20.deploy()


@pytest.fixture(scope="session")
def fund_me(mock_erc20: VyperContract) -> VyperContract:
    """
    Fixture to provide a FundMe contract instance for testing.
    Deploys the FundMe contract, passing the mock_erc20 address.
    """
    return deploy_fund_me.deploy(mock_erc20.address)


@pytest.fixture(scope="function")
def owner(fund_me: VyperContract) -> str:
    """
    Fixture to get the owner address of the FundMe contract.
    """
    return fund_me.owner()


# WIP

# @pytest.fixture(scope="function")
# def accounts() -> list[str]:
#     """
#     Fixture to get a list of available accounts for testing.
#     """
#     # Moccasin/Titanoboa provides a default set of accounts for testing.
#     # You can access them via the titanoboa.builtin_contracts.evm.accounts
#     from titanoboa.builtin_contracts.evm import accounts

#     return accounts


# @pytest.fixture(scope="function")
# def funder_account(accounts: list[str]) -> str:
#     """
#     Fixture to provide a funder account (e.g., accounts[1]).
#     """
#     return accounts[1]


# @pytest.fixture(scope="function")
# def another_funder_account(accounts: list[str]) -> str:
#     """
#     Fixture to provide another funder account (e.g., accounts[2]).
#     """
#     return accounts[2]
