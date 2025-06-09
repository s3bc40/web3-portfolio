import boa
import pytest

from boa.test.strategies import given, strategy as st_boa
from hypothesis import strategies as st

from eth.constants import ZERO_ADDRESS
from eth.exceptions import Revert
from moccasin.boa_tools import VyperContract
from moccasin.config import get_active_network
from utils.constants import (
    FUNDER_COUNT,
    MINIMUM_FUNDING_AMOUNT_WEI,
    ONE_ETH_IN_WEI,
    FUNDER_INITIAL_BALANCE_WEI,
)


active_network = get_active_network()


################################################################
#                         FUNDME INIT                          #
################################################################
def test_fund_me_deployed(fund_me: VyperContract, owner: str):
    """
    Test that the contract is deployed and basic properties are set.
    """
    assert fund_me is not None, "Contract should be deployed"
    assert fund_me.address is not None, "Contract address should not be None"
    assert fund_me.owner() == owner, "Contract owner should be the deployer"
    assert fund_me.balance_of_eth() == 0, "Initial ETH balance should be 0"
    assert fund_me.balance_of_zk_token() == 0, "Initial ZK token balance should be 0"
    assert fund_me.funder_count() == 0, "Initial funder count should be 0"
    assert fund_me.get_minimal_funding_amount() == MINIMUM_FUNDING_AMOUNT_WEI, (
        "Minimum funding amount should match"
    )
    assert fund_me.get_zk_token_address() is not None, "ZK token address should be set"


def test_fallback_rejects_direct_eth_transfer(fund_me, funders):
    """
    Test that direct ETH transfers to the contract are rejected by the fallback.
    """
    # Use pytest.raises to assert that a Revert exception is raised
    with pytest.raises(Revert) as excinfo:
        boa.env.raw_call(
            fund_me.address,
            data=b"",  # Empty calldata for direct ETH transfer
            value=ONE_ETH_IN_WEI,  # Attempt to send 1 ETH
            sender=funders[0],
        )

    expected_revert_message_part = fund_me.DIRECT_TRANSFER_ERROR()
    assert expected_revert_message_part in str(excinfo.value.args[0])


################################################################
#                         FUNDING ETH                          #
################################################################
def test_fund_eth_zero_address(fund_me):
    """
    Test ETH funding from a zero address.
    """
    boa.env.set_balance(ZERO_ADDRESS.hex(), FUNDER_INITIAL_BALANCE_WEI)
    with boa.reverts(fund_me.ZERO_ADDRESS_ERROR()):
        fund_me.fund_eth(sender=ZERO_ADDRESS.hex(), value=MINIMUM_FUNDING_AMOUNT_WEI)


@pytest.mark.skipif(
    active_network.is_zksync,
    reason="Fuzzing with anvil zksync does not take hypothesis  settings.",
)
@given(
    index=st.integers(min_value=0, max_value=FUNDER_COUNT - 1),
    amount=st_boa(
        "uint256",
        min_value=0,
        max_value=MINIMUM_FUNDING_AMOUNT_WEI - 1,
    ),
)
def test_fund_eth_insufficient_amount(fund_me, funders, amount: int, index: int):
    """
    Test ETH funding with insufficient amount.
    """
    funder_account = funders[index]
    with boa.reverts(fund_me.INSUFFICIENT_AMOUNT_ERROR()):
        fund_me.fund_eth(sender=funder_account, value=amount)


@pytest.mark.skipif(
    active_network.is_zksync,
    reason="Fuzzing with anvil zksync does not take hypothesis  settings.",
)
@given(
    index=st.integers(min_value=0, max_value=FUNDER_COUNT - 1),
    amount=st_boa(
        "uint256",
        min_value=MINIMUM_FUNDING_AMOUNT_WEI,
        max_value=FUNDER_INITIAL_BALANCE_WEI,
    ),
)
def test_fund_eth_success_fuzz(fund_me, funders, amount: int, index: int):
    """
    Test successful ETH funding.
    """
    funder_account = funders[index]
    initial_contract_eth_balance = fund_me.balance_of_eth()
    initial_funder_eth_balance = fund_me.get_funder_eth_amount(funder_account)
    initial_funder_count = fund_me.funder_count()
    is_new_funder = (
        fund_me.get_funder_eth_amount(funder_account) == 0
        and fund_me.get_funder_zk_token_amount(funder_account) == 0
    )

    # Fund ETH
    with boa.env.prank(funder_account):
        fund_me.fund_eth(value=amount)
        logs = fund_me.get_logs()
        log_funder = logs[0].funder
        log_amount = logs[0].amount

    # Assert contract balance increased
    assert fund_me.balance_of_eth() == initial_contract_eth_balance + amount
    # Assert funder's recorded balance increased
    assert (
        fund_me.get_funder_eth_amount(funder_account)
        == initial_funder_eth_balance + amount
    )
    # Assert funder count increased if new funder
    if is_new_funder:
        assert fund_me.funder_count() == initial_funder_count + 1
    else:
        assert fund_me.funder_count() == initial_funder_count

    # Assert event emission
    assert len(logs) == 1, "Should emit one FundedEth event"
    assert log_funder == funder_account, "Funder address should match"
    assert log_amount == amount, "Funded amount should match"

    # Assert contract's actual ETH balance matches recorded balance
    assert fund_me.balance_of_eth() == boa.env.get_balance(fund_me.address)


################################################################
#                          FUNDING ZK                          #
################################################################
def test_fund_zk_token_zero_address(fund_me):
    """
    Test ZK token funding from a zero address.
    """
    with boa.reverts(fund_me.ZERO_ADDRESS_ERROR()):
        fund_me.fund_zk_token(1, sender=ZERO_ADDRESS.hex())


@pytest.mark.skipif(
    active_network.is_zksync,
    reason="Fuzzing with anvil zksync does not take hypothesis  settings.",
)
@given(
    index=st.integers(min_value=0, max_value=FUNDER_COUNT - 1),
    amount=st_boa(
        "uint256",
        min_value=0,
        max_value=MINIMUM_FUNDING_AMOUNT_WEI - 1,
    ),
)
def test_fund_zk_token_insufficient_amount(fund_me, funders, amount: int, index: int):
    """
    Test ZK token funding with insufficient amount.
    """
    funder_account = funders[index]
    with boa.reverts(fund_me.INSUFFICIENT_AMOUNT_ERROR()):
        fund_me.fund_zk_token(amount, sender=funder_account)


@pytest.mark.skipif(
    active_network.is_zksync,
    reason="Fuzzing with anvil zksync does not take hypothesis  settings.",
)
@given(
    index=st.integers(min_value=0, max_value=FUNDER_COUNT - 1),
    amount=st_boa(
        "uint256",
        min_value=MINIMUM_FUNDING_AMOUNT_WEI,
        max_value=FUNDER_INITIAL_BALANCE_WEI,
    ),
)
def test_fund_zk_token_success_fuzz(
    fund_me, mock_zktoken, funders, amount: int, index: int
):
    """
    Test successful ZK token funding.
    """
    funder_account = funders[index]
    initial_contract_zk_balance = fund_me.balance_of_zk_token()
    initial_funder_zk_balance = fund_me.get_funder_zk_token_amount(funder_account)
    initial_funder_count = fund_me.funder_count()
    is_new_funder = (
        fund_me.get_funder_eth_amount(funder_account) == 0
        and fund_me.get_funder_zk_token_amount(funder_account) == 0
    )

    # Approve ZK tokens for the contract
    with boa.env.prank(funder_account):
        mock_zktoken.approve(fund_me.address, amount)

    # Fund ZK tokens
    with boa.env.prank(funder_account):
        fund_me.fund_zk_token(amount)
        logs = fund_me.get_logs()
        log_funder = logs[2].funder
        log_amount = logs[2].amount

    # Assert contract ZK token balance increased
    assert fund_me.balance_of_zk_token() == initial_contract_zk_balance + amount
    # Assert funder's recorded ZK token balance increased
    assert (
        fund_me.get_funder_zk_token_amount(funder_account)
        == initial_funder_zk_balance + amount
    )
    # Assert funder count increased if new funder
    if is_new_funder:
        assert fund_me.funder_count() == initial_funder_count + 1
    else:
        assert fund_me.funder_count() == initial_funder_count

    # Assert event emission
    assert len(logs) > 0, "Should emit one FundedZKToken event"
    assert log_funder == funder_account, "Funder address should match"
    assert log_amount == amount, "Funded amount should match"

    # Assert contract's actual ZK token balance matches recorded balance
    assert mock_zktoken.balanceOf(fund_me.address) == fund_me.balance_of_zk_token()


################################################################
#                         FUNDER COUNT                         #
################################################################
def test_fund_zk_only_and_check_funder_count(fund_me, mock_zktoken, funders):
    """
    Test funding with ZK tokens only and verify funder count.
    This specifically targets the case where a funder only contributes ZK tokens.
    """
    funder_account = funders[0]
    zk_amount = 2 * MINIMUM_FUNDING_AMOUNT_WEI

    initial_funder_count = fund_me.funder_count()
    assert fund_me.get_funder_eth_amount(funder_account) == 0
    assert fund_me.get_funder_zk_token_amount(funder_account) == 0

    # Approve ZK tokens and fund
    with boa.env.prank(funder_account):
        mock_zktoken.approve(fund_me.address, zk_amount)
        fund_me.fund_zk_token(zk_amount)

    assert fund_me.get_funder_zk_token_amount(funder_account) == zk_amount
    assert fund_me.funder_count() == initial_funder_count + 1


def test_fund_both_eth_and_zk(fund_me, mock_zktoken, funders):
    """
    Test a single funder funding with both ETH and ZK tokens.
    """
    funder_account = funders[0]
    eth_amount = 2 * MINIMUM_FUNDING_AMOUNT_WEI
    zk_amount = 3 * MINIMUM_FUNDING_AMOUNT_WEI

    # Fund ETH
    with boa.env.prank(funder_account):
        fund_me.fund_eth(value=eth_amount)

    # Approve ZK tokens and fund
    with boa.env.prank(funder_account):
        mock_zktoken.approve(fund_me.address, zk_amount)
        fund_me.fund_zk_token(zk_amount)

    assert fund_me.get_funder_eth_amount(funder_account) == eth_amount
    assert fund_me.get_funder_zk_token_amount(funder_account) == zk_amount
    assert fund_me.balance_of_eth() == eth_amount
    assert fund_me.balance_of_zk_token() == zk_amount
    assert fund_me.funder_count() == 1  # Still one unique funder


################################################################
#                         WITHDRAW ETH                         #
################################################################
def test_withdraw_eth_not_owner(fund_me, funders):
    """
    Test ETH withdrawal by a non-owner.
    """
    with boa.reverts("ownable: caller is not the owner"):
        fund_me.withdraw_eth(ONE_ETH_IN_WEI, sender=funders[0])


def test_withdraw_eth_insufficient_contract_balance(fund_me, owner):
    """
    Test ETH withdrawal when contract has insufficient balance.
    """
    with boa.reverts(fund_me.WITHDRAWAL_AMOUNT_EXCEEDS_BALANCE_ERROR()):
        fund_me.withdraw_eth(MINIMUM_FUNDING_AMOUNT_WEI, sender=owner)


def test_withdraw_eth_zero_amount(fund_me, funders):
    """
    Test ETH withdrawal with zero amount.
    """
    # Fund the contract first to have balance
    fund_me.fund_eth(sender=funders[0], value=MINIMUM_FUNDING_AMOUNT_WEI)
    with boa.reverts(fund_me.INSUFFICIENT_AMOUNT_ERROR()):
        fund_me.withdraw_eth(0, sender=fund_me.owner())


@pytest.mark.skipif(
    active_network.is_zksync,
    reason="Fuzzing with anvil zksync does not take hypothesis  settings.",
)
@given(
    amount=st_boa(
        "uint256",
        min_value=MINIMUM_FUNDING_AMOUNT_WEI,
        max_value=FUNDER_INITIAL_BALANCE_WEI,
    ),
    index=st.integers(min_value=0, max_value=FUNDER_COUNT - 1),
)
def test_withdraw_eth_success_fuzz(fund_me, funders, amount: int, index: int):
    """
    Test successful ETH withdrawal.
    """
    funder_account = funders[index]
    owner = fund_me.owner()

    # Fund the contract first
    fund_me.fund_eth(sender=funder_account, value=amount)

    initial_owner_balance = boa.env.get_balance(owner)
    contract_eth_balance_before_withdraw = fund_me.balance_of_eth()

    # Withdraw ETH
    with boa.env.prank(owner):
        fund_me.withdraw_eth(amount)
        logs = fund_me.get_logs()
        log_to = logs[0].to
        log_amount = logs[0].amount

    # Assert contract balance decreased
    assert fund_me.balance_of_eth() == contract_eth_balance_before_withdraw - amount
    # Assert owner's ETH balance increased
    assert boa.env.get_balance(owner) > initial_owner_balance  # Account for gas fees
    # Assert event emission
    assert len(logs) == 1, "Should emit one WithdrawEth event"
    assert log_to == fund_me.owner(), "Withdrawal recipient should match funder"
    assert log_amount == amount, "Withdrawn amount should match"


################################################################
#                         WITHDRAW ZK                          #
################################################################
def test_withdraw_zk_token_not_owner(fund_me, funders):
    """
    Test ZK token withdrawal by a non-owner.
    """
    with boa.env.prank(funders[0]):
        with boa.reverts("ownable: caller is not the owner"):
            fund_me.withdraw_zk_token(MINIMUM_FUNDING_AMOUNT_WEI)


def test_withdraw_zk_token_insufficient_contract_balance(fund_me, owner):
    """
    Test ZK token withdrawal when contract has insufficient balance.
    """
    with boa.env.prank(owner):
        with boa.reverts(fund_me.WITHDRAWAL_AMOUNT_EXCEEDS_BALANCE_ERROR()):
            fund_me.withdraw_zk_token(MINIMUM_FUNDING_AMOUNT_WEI)


def test_withdraw_zk_token_zero_amount(fund_me, mock_zktoken, owner, funders):
    """
    Test ZK token withdrawal with zero amount.
    """
    # Fund the contract with ZK tokens first
    with boa.env.prank(funders[0]):
        mock_zktoken.approve(fund_me.address, MINIMUM_FUNDING_AMOUNT_WEI)
        fund_me.fund_zk_token(MINIMUM_FUNDING_AMOUNT_WEI)

    # Attempt to withdraw zero amount
    with boa.env.prank(owner):
        with boa.reverts(fund_me.INSUFFICIENT_AMOUNT_ERROR()):
            fund_me.withdraw_zk_token(0)


@pytest.mark.skipif(
    active_network.is_zksync,
    reason="Fuzzing with anvil zksync does not take hypothesis  settings.",
)
@given(
    amount=st_boa(
        "uint256",
        min_value=MINIMUM_FUNDING_AMOUNT_WEI,
        max_value=FUNDER_INITIAL_BALANCE_WEI,
    ),
    index=st.integers(min_value=0, max_value=FUNDER_COUNT - 1),
)
def test_withdraw_zk_token_success_fuzz(
    fund_me,
    mock_zktoken,
    funders,
    amount: int,
    index: int,
):
    """
    Test successful ZK token withdrawal.
    """
    # Fund the contract first
    funder_account = funders[index]
    owner = fund_me.owner()
    with boa.env.prank(funder_account):
        mock_zktoken.approve(fund_me.address, amount)
        fund_me.fund_zk_token(amount)

    initial_owner_zk_balance = mock_zktoken.balanceOf(owner)
    contract_zk_balance_before_withdraw = fund_me.balance_of_zk_token()

    # Withdraw ZK token
    with boa.env.prank(owner):
        fund_me.withdraw_zk_token(amount)
        logs = fund_me.get_logs()
        log_to = logs[1].to
        log_amount = logs[1].amount

    # Assert contract ZK token balance decreased
    assert fund_me.balance_of_zk_token() == contract_zk_balance_before_withdraw - amount
    # Assert owner's ZK token balance increased
    assert mock_zktoken.balanceOf(owner) == initial_owner_zk_balance + amount
    # Assert event emission
    assert len(logs) > 0, "Should emit one WithdrawZK event"
    assert log_to == owner, "Withdrawal recipient should match owner"
    assert log_amount == amount, "Withdrawn amount should match"


################################################################
#                     SET ZK TOKEN ADDRESS                     #
################################################################
def test_set_zk_token_address_not_owner(fund_me, funders):
    """
    Test setting ZK token address by a non-owner.
    """
    new_zk_token_address = boa.env.generate_address("new_zk_token")
    with boa.env.prank(funders[0]):
        with boa.reverts("ownable: caller is not the owner"):
            fund_me.set_zk_token_address(new_zk_token_address)


def test_set_zk_token_address_zero_address(fund_me, owner):
    """
    Test setting ZK token address to zero address.
    """
    with boa.env.prank(owner):
        with boa.reverts(fund_me.ZERO_ADDRESS_ERROR()):
            fund_me.set_zk_token_address(ZERO_ADDRESS.hex())


def test_set_zk_token_address_success(fund_me, owner):
    """
    Test setting ZK token address successfully.
    """
    new_zk_token_address = boa.env.generate_address("new_zk_token")
    with boa.env.prank(owner):
        fund_me.set_zk_token_address(new_zk_token_address)

    # Assert the new ZK token address is set correctly
    assert fund_me.get_zk_token_address() == new_zk_token_address

    # Assert the contract can still interact with the mock ZK token
    assert fund_me.get_funder_zk_token_amount(owner) == 0


################################################################
#                        VIEW FUNCTIONS                        #
################################################################
def test_get_funder_eth_amount(fund_me, funders):
    """
    Test get_funder_eth_amount view function.
    """
    funder1 = funders[0]
    funder2 = funders[1]
    amount1 = 2 * MINIMUM_FUNDING_AMOUNT_WEI
    amount2 = 3 * MINIMUM_FUNDING_AMOUNT_WEI

    # Initial check
    assert fund_me.get_funder_eth_amount(funder1) == 0
    assert fund_me.get_funder_eth_amount(funder2) == 0

    # Fund from funder1
    with boa.env.prank(funder1):
        fund_me.fund_eth(value=amount1)
    assert fund_me.get_funder_eth_amount(funder1) == amount1
    assert fund_me.get_funder_eth_amount(funder2) == 0

    # Fund more from funder1
    with boa.env.prank(funder1):
        fund_me.fund_eth(value=MINIMUM_FUNDING_AMOUNT_WEI)
    assert (
        fund_me.get_funder_eth_amount(funder1) == amount1 + MINIMUM_FUNDING_AMOUNT_WEI
    )

    # Fund from funder2
    with boa.env.prank(funder2):
        fund_me.fund_eth(value=amount2)
    assert fund_me.get_funder_eth_amount(funder2) == amount2


def test_get_funder_zk_token_amount(fund_me, mock_zktoken, funders):
    """
    Test get_funder_zk_token_amount view function.
    """
    funder1 = funders[0]
    funder2 = funders[1]
    amount1 = 2 * MINIMUM_FUNDING_AMOUNT_WEI
    amount2 = 3 * MINIMUM_FUNDING_AMOUNT_WEI

    # Initial check
    assert fund_me.get_funder_zk_token_amount(funder1) == 0
    assert fund_me.get_funder_zk_token_amount(funder2) == 0

    # Fund from funder1
    with boa.env.prank(funder1):
        mock_zktoken.approve(fund_me.address, amount1)
        fund_me.fund_zk_token(amount1)
    assert fund_me.get_funder_zk_token_amount(funder1) == amount1
    assert fund_me.get_funder_zk_token_amount(funder2) == 0

    # Fund more from funder1
    with boa.env.prank(funder1):
        mock_zktoken.approve(fund_me.address, MINIMUM_FUNDING_AMOUNT_WEI)
        fund_me.fund_zk_token(MINIMUM_FUNDING_AMOUNT_WEI)
    assert (
        fund_me.get_funder_zk_token_amount(funder1)
        == amount1 + MINIMUM_FUNDING_AMOUNT_WEI
    )

    # Fund from funder2
    with boa.env.prank(funder2):
        mock_zktoken.approve(fund_me.address, amount2)
        fund_me.fund_zk_token(amount2)
    assert fund_me.get_funder_zk_token_amount(funder2) == amount2


def test_get_minimal_funding_amount(fund_me):
    """
    Test get_minimal_funding_amount view function.
    """
    assert fund_me.get_minimal_funding_amount() == MINIMUM_FUNDING_AMOUNT_WEI


def test_get_zk_token_address(fund_me, mock_zktoken):
    """
    Test get_zk_token_address view function.
    """
    assert fund_me.get_zk_token_address() == mock_zktoken.address
