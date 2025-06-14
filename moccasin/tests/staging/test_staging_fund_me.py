import boa
import pytest

from moccasin.boa_tools import VyperContract

from utils.constants import MINIMUM_FUNDING_AMOUNT_WEI


################################################################
#                         STAGING INIT                         #
################################################################
@pytest.mark.staging
@pytest.mark.ignore_isolation
def test_contract_deployment_and_owner(
    staging_fund_contract: VyperContract, staging_owner: str
):
    """
    Tests that the contract is deployed and the owner is set correctly.
    """
    assert staging_fund_contract.address is not None, (
        "Contract address should not be None"
    )
    assert staging_fund_contract.owner() == staging_owner, "Contract owner mismatch"


@pytest.mark.staging
@pytest.mark.ignore_isolation
def test_initial_state_variables(staging_fund_contract: VyperContract):
    """
    Tests the initial state variables of the deployed contract.
    """
    assert staging_fund_contract.balance_of_eth() == 0, (
        "Initial ETH balance should be 0"
    )
    assert staging_fund_contract.balance_of_zk_token() == 0, (
        "Initial ZK token balance should be 0"
    )
    assert staging_fund_contract.funder_count() == 0, "Initial funder count should be 0"


@pytest.mark.staging
@pytest.mark.ignore_isolation
def test_get_minimal_funding_amount(staging_fund_contract: VyperContract):
    """
    Tests the get_minimal_funding_amount view function.
    """
    min_funding_amount = staging_fund_contract.get_minimal_funding_amount()
    expected_min_funding = MINIMUM_FUNDING_AMOUNT_WEI
    assert min_funding_amount == expected_min_funding, "Minimal funding amount mismatch"


################################################################
#                  STAGING FUND/WITHDRAW ETH                   #
################################################################
@pytest.mark.staging
@pytest.mark.ignore_isolation
def test_fund_eth_staging(staging_fund_contract: VyperContract, staging_owner: str):
    """
    Tests funding ETH on the live network.
    Requires the 'owner' account to have sufficient ETH.
    """
    initial_eth_balance_contract = staging_fund_contract.balance_of_eth()

    # Ensure the owner has enough ETH
    owner_balance = boa.env.get_balance(staging_owner)
    assert owner_balance >= MINIMUM_FUNDING_AMOUNT_WEI, (
        "Owner does not have enough ETH to fund."
    )

    # Perform the transaction
    with boa.env.prank(staging_owner):
        staging_fund_contract.fund_eth(value=MINIMUM_FUNDING_AMOUNT_WEI)

    # Check the new state of the contract
    new_eth_balance_contract = staging_fund_contract.balance_of_eth()
    funder_eth_amount = staging_fund_contract.get_funder_eth_amount(staging_owner)
    funder_count = staging_fund_contract.funder_count()

    assert (
        new_eth_balance_contract
        == initial_eth_balance_contract + MINIMUM_FUNDING_AMOUNT_WEI
    ), "Contract ETH balance not updated correctly"

    assert funder_eth_amount == MINIMUM_FUNDING_AMOUNT_WEI, (
        "Funder ETH amount not recorded correctly"
    )

    assert funder_count >= 1, "Funder count not incremented correctly"


@pytest.mark.staging
@pytest.mark.ignore_isolation
def test_withdraw_eth_staging(staging_fund_contract: VyperContract, staging_owner: str):
    """
    Tests withdrawing ETH from the contract on the live network.
    Requires the 'owner' account to have funded the contract.
    """
    initial_eth_balance_contract = staging_fund_contract.balance_of_eth()
    initial_owner_balance = boa.env.get_balance(staging_owner)

    # Perform the withdrawal
    with boa.env.prank(staging_owner):
        staging_fund_contract.withdraw_eth(MINIMUM_FUNDING_AMOUNT_WEI)

    # Check the new state of the contract
    new_eth_balance_contract = staging_fund_contract.balance_of_eth()
    new_owner_balance = boa.env.get_balance(staging_owner)

    assert (
        new_eth_balance_contract
        == initial_eth_balance_contract - MINIMUM_FUNDING_AMOUNT_WEI
    ), "Contract ETH balance not updated correctly after withdrawal"
    # @dev Check if the owner's balance increased by the withdrawn amount
    #   since equality check is not possible due to gas fees
    assert new_owner_balance > initial_owner_balance, (
        "Owner's ETH balance not updated correctly after withdrawal"
    )


################################################################
#                   STAGING FUND/WITHDRAW ZK                   #
################################################################
@pytest.mark.staging
@pytest.mark.ignore_isolation
def test_fund_zk_staging(staging_fund_contract, staging_zktoken, staging_owner):
    """
    Tests funding ZK tokens on the live network.
    Requires the 'owner' to have sufficient ZK tokens.
    """
    initial_zk_balance_contract = staging_fund_contract.balance_of_zk_token()

    # Ensure the funder has enough ZK tokens
    funder_balance = staging_zktoken.balanceOf(staging_owner)
    assert funder_balance >= MINIMUM_FUNDING_AMOUNT_WEI, (
        "Owner does not have enough ZK tokens to fund."
    )

    # Perform the transaction
    with boa.env.prank(staging_owner):
        staging_zktoken.approve(
            staging_fund_contract.address, MINIMUM_FUNDING_AMOUNT_WEI
        )
        staging_fund_contract.fund_zk_token(MINIMUM_FUNDING_AMOUNT_WEI)

    # Check the new state of the contract
    new_zk_balance_contract = staging_fund_contract.balance_of_zk_token()
    funder_count = staging_fund_contract.funder_count()

    assert (
        new_zk_balance_contract
        == initial_zk_balance_contract + MINIMUM_FUNDING_AMOUNT_WEI
    ), "Contract ZK token balance not updated correctly"

    assert funder_count >= 1, "Funder count not incremented correctly"


@pytest.mark.staging
@pytest.mark.ignore_isolation
def test_withdraw_zk_staging(staging_fund_contract, staging_zktoken, staging_owner):
    """
    Tests withdrawing ZK tokens from the contract on the live network.
    Requires the 'owner' account to have funded the contract.
    """
    initial_zk_balance_contract = staging_fund_contract.balance_of_zk_token()
    assert initial_zk_balance_contract > 0, (
        "Contract ZK token balance should be greater than 0 before withdrawal"
    )
    initial_owner_balance = staging_zktoken.balanceOf(staging_owner)

    # Perform the withdrawal
    with boa.env.prank(staging_owner):
        staging_fund_contract.withdraw_zk_token(MINIMUM_FUNDING_AMOUNT_WEI)

    # Check the new state of the contract
    new_zk_balance_contract = staging_fund_contract.balance_of_zk_token()
    new_owner_balance = staging_zktoken.balanceOf(staging_owner)

    assert (
        new_zk_balance_contract
        == initial_zk_balance_contract - MINIMUM_FUNDING_AMOUNT_WEI
    ), "Contract ZK token balance not updated correctly after withdrawal"
    assert new_owner_balance == initial_owner_balance + MINIMUM_FUNDING_AMOUNT_WEI, (
        "Owner's ZK token balance not updated correctly after withdrawal"
    )
