# @dev you need to run `anvil --block-time 1` if you run on `anvil-staging` network
#    you might have to run a few time to let it mine some blocks
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


################################################################
#                           SETTINGS                           #
################################################################
active_network = get_active_network()

# Hypothesis settings
# @dev see https://hypothesis.readthedocs.io/en/latest/reference/api.html#hypothesis.settings
settings.register_profile(
    "invariant",
    max_examples=256,
    stateful_step_count=50,
)
# @dev set examples to 1 with eravm since not supported with boa-zksync
settings.register_profile(
    "zksync_fuzzing",
    max_examples=1,
    stateful_step_count=1,
)
settings.register_profile("zksync_invariant", max_examples=1, stateful_step_count=1)


# Pytest hook to configure Hypothesis settings based on the active network
def pytest_configure(config):
    """
    Called after command line options have been parsed and all plugins
    and initial conftest files been loaded.

    @dev https://docs.pytest.org/en/7.1.x/reference/reference.html#pytest.hookspec.pytest_configure
    """
    if active_network.is_zksync:
        settings.load_profile("zksync_fuzzing")
        print("\n[Hypothesis] Loaded profile: 'zksync_fuzzing'")
    else:
        # Load a default profile or any other desired profile for non-ZKSync networks
        settings.load_profile("default")  # 'default' is a built-in Hypothesis profile
        print("\n[Hypothesis] Loaded profile: 'default'")


################################################################
#                        UNIT FIXTURES                         #
################################################################
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


################################################################
#                       STAGING FIXTURES                       #
################################################################
@pytest.fixture(scope="session")
def staging_fund_contract() -> VyperContract:
    """Fixture to deploy the FundMe contract for staging tests.

    Deploys the FundMe contract using the active network's ZK token address.
    """
    return active_network.manifest_named("fund_me")


@pytest.fixture(scope="session")
def staging_zktoken(staging_fund_contract) -> VyperContract:
    """Fixture to provide a mock ZK token contract instance for staging tests.

    Returns the mock ZK token contract instance used by the FundMe contract.
    """
    # return active_network.manifest_named("zktoken")
    return mock_zk_token.at(staging_fund_contract.get_zk_token_address())


@pytest.fixture(scope="session")
def staging_owner(staging_fund_contract, staging_zktoken) -> str:
    """Fixture to provide the owner address for staging tests.

    Returns the address of the owner.
    """
    owner: str = staging_fund_contract.owner()
    staging_zktoken.mint(owner, FUNDER_INITIAL_BALANCE_WEI)
    return owner
