import boa
import pytest

from moccasin.boa_tools import VyperContract
from script import deploy_fund_me
# from script.mocks import deploy_mock_zk_token


# @pytest.fixture(scope="session")
# def mock_zktoken() -> VyperContract:
#     """
#     Fixture to provide a MockERC20 contract instance for testing.
#     Deploys the MockERC20 contract.
#     """
#     return deploy_mock_zk_token.deploy()


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
