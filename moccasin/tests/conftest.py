import boa
import pytest

from hypothesis import settings
from moccasin.boa_tools import VyperContract
from moccasin.config import get_active_network
from script import deploy_fund_me
from src.mocks import mock_zk_token
from utils.constants import (
    FUNDER_COUNT,
    FUNDER_INITIAL_BALANCE_WEI,
)


# Hypothesis settings
# @dev see https://hypothesis.readthedocs.io/en/latest/reference/api.html#hypothesis.settings
settings.register_profile(
    "invariant",
    max_examples=256,
    stateful_step_count=50,
)
settings.register_profile(
    "zksync_fuzzing",
    max_examples=2,
    stateful_step_count=1,
)
settings.register_profile("zksync_invariant", max_examples=10, stateful_step_count=5)


# Pytest hook to configure Hypothesis settings based on the active network
def pytest_configure(config):
    """
    Called after command line options have been parsed and all plugins
    and initial conftest files been loaded.

    @dev https://docs.pytest.org/en/7.1.x/reference/reference.html#pytest.hookspec.pytest_configure
    """
    active_network = get_active_network()

    if active_network.is_zksync:
        settings.load_profile("zksync_fuzzing")
        print("\n[Hypothesis] Loaded profile: 'zksync_fuzzing'")
    else:
        # Load a default profile or any other desired profile for non-ZKSync networks
        settings.load_profile("default")  # 'default' is a built-in Hypothesis profile
        print("\n[Hypothesis] Loaded profile: 'default'")


# Fixtures
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
