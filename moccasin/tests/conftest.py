import boa
import pytest

from moccasin.boa_tools import VyperContract
from script import deploy_fund_me


@pytest.fixture(scope="session")
def owner() -> str:
    """
    Fixture to provide the owner address for testing.
    Returns the address of the owner.
    """
    return boa.env.generate_address("owner")


@pytest.fixture(scope="session")
def fund_me(owner) -> VyperContract:
    """
    Fixture to provide a FundMe contract instance for testing.
    Deploys the FundMe contract, passing the mock_zktoken address.
    """
    with boa.env.prank(owner):
        return deploy_fund_me.deploy()


@pytest.fixture(scope="session")
def funders() -> list[str]:
    """
    Fixture to provide a list of funders' addresses for testing.
    Returns a list of addresses that will be used as funders.
    """
    funders = [boa.env.generate_address(f"funder_{i}") for i in range(5)]
    for funder in funders:
        boa.env.set_balance(funder, 1000 * 10**18)
    return funders
