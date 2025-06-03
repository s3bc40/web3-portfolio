import boa
import pytest

from moccasin.boa_tools import VyperContract
from script import deploy_fund_me
from src.mocks import mock_zk_token
from utils.constants import (
    FUNDER_COUNT,
    FUNDER_INITIAL_BALANCE_WEI,
)


@pytest.fixture(scope="session")
def owner() -> str:
    """Fixture to provide the owner address for testing.

    Returns the address of the owner.
    """
    return boa.env.eoa


@pytest.fixture(scope="session")
def fund_me() -> VyperContract:
    """Fixture to provide a FundMe contract instance for testing.

    Deploys the FundMe contract, passing the mock_zktoken address.
    """
    return deploy_fund_me.deploy()


@pytest.fixture(scope="session")
def mock_zktoken(fund_me) -> VyperContract:
    """Fixture to provide a mock ZK token contract instance for testing.

    Deploys the mock ZK token contract and returns its instance.
    """
    return mock_zk_token.at(fund_me.get_zk_token_address())


@pytest.fixture(scope="session")
def funders(mock_zktoken) -> list[str]:
    """Fixture to provide a list of funders' addresses for testing.

    Returns a list of addresses that will be used as funders.
    """
    funders = [boa.env.generate_address(f"funder_{i}") for i in range(FUNDER_COUNT)]
    for funder in funders:
        boa.env.set_balance(funder, FUNDER_INITIAL_BALANCE_WEI)
        # Fund zk token for each funder
        mock_zktoken.mint(funder, FUNDER_INITIAL_BALANCE_WEI)
    return funders
