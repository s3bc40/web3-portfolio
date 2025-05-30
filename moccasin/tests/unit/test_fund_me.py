import boa
import pytest

from boa.test.strategies import given, strategy as st_boa
from hypothesis import strategies as st

from eth.constants import ZERO_ADDRESS
from eth.exceptions import Revert
from moccasin.boa_tools import VyperContract
from utils.constants import (
    FUNDER_COUNT,
    MINIMUM_FUNDING_AMOUNT_WEI,
    ONE_ETH_IN_WEI,
    FUNDER_INITIAL_BALANCE_WEI,
)

################################################################
#                           HELPERS                            #
################################################################


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
#                           FUNDING                            #
################################################################


def test_fund_eth_zero_address(fund_me):
    """
    Test ETH funding from a zero address.
    """
    boa.env.set_balance(ZERO_ADDRESS, FUNDER_INITIAL_BALANCE_WEI)
    with boa.reverts(fund_me.ZERO_ADDRESS_ERROR()):
        fund_me.fund_eth(sender=ZERO_ADDRESS, value=MINIMUM_FUNDING_AMOUNT_WEI)


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

    # Fund ETH
    with boa.env.prank(funder_account):
        fund_me.fund_eth(value=amount)
        logs = fund_me.get_logs()
        log_funder = logs[0].funder
        log_amount = logs[0].amount

    # Assert contract balance increased
    assert fund_me.balance_of_eth() == initial_contract_eth_balance + amount
    # Assert funder's recorded balance increased and matches the contract balance
    assert fund_me.balance_of_eth() == boa.env.get_balance(fund_me.address)
    # Assert funder's recorded balance increased
    assert (
        fund_me.get_funder_eth_amount(funder_account)
        == initial_funder_eth_balance + amount
    )
    # Assert funder count increased if new funder
    assert fund_me.funder_count() == 1
    # Assert event emission
    assert len(logs) == 1, "Should emit one FundedEth event"
    assert log_funder == funder_account, "Funder address should match"
    assert log_amount == amount, "Funded amount should match"


# def test_fund_zk_token_success(
#     fund_me: VyperContract, mock_erc20: VyperContract, funder_account: str, owner: str
# ):
#     """
#     Test successful ZK token funding.
#     """
#     amount = 100 * 10**ZK_DECIMALS  # 100 ZK tokens
#     # Mint some tokens to the funder's account for testing
#     mock_erc20.mint(
#         funder_account, amount * 2, sender=owner
#     )  # Mint more than needed for allowance and transfer
#     assert mock_erc20.balanceOf(funder_account) >= amount, (
#         "Funder should have enough ZK tokens"
#     )

#     # Approve the fund_me contract to spend ZK tokens
#     mock_erc20.approve(fund_me.address, amount, sender=funder_account)
#     assert mock_erc20.allowance(funder_account, fund_me.address) == amount, (
#         "Allowance should be set"
#     )

#     initial_contract_zk_balance = fund_me.balance_of_zk_token()
#     initial_funder_zk_balance = fund_me.get_funder_zk_token_amount(funder_account)
#     initial_funder_erc20_balance = mock_erc20.balanceOf(funder_account)

#     # Fund ZK tokens
#     fund_me.fund_zk_token(amount, sender=funder_account)

#     # Assert contract ZK balance increased
#     assert fund_me.balance_of_zk_token() == initial_contract_zk_balance + amount
#     # Assert funder's recorded ZK balance increased
#     assert (
#         fund_me.get_funder_zk_token_amount(funder_account)
#         == initial_funder_zk_balance + amount
#     )
#     # Assert funder's ERC20 balance decreased
#     assert mock_erc20.balanceOf(funder_account) == initial_funder_erc20_balance - amount
#     # Assert funder count increased if new funder
#     assert fund_me.funder_count() == 1

#     # Test event emission
#     events = fund_me.get_events("FundedZKToken")
#     assert len(events) == 1
#     assert events[0].funder == funder_account
#     assert events[0].amount == amount

#     # Fund ZK again from the same funder
#     mock_erc20.approve(
#         fund_me.address, amount, sender=funder_account
#     )  # Approve again for the second transfer
#     fund_me.fund_zk_token(amount, sender=funder_account)
#     assert fund_me.balance_of_zk_token() == initial_contract_zk_balance + (2 * amount)
#     assert fund_me.get_funder_zk_token_amount(
#         funder_account
#     ) == initial_funder_zk_balance + (2 * amount)
#     assert fund_me.funder_count() == 1  # Still 1 funder


# def test_fund_zk_token_insufficient_amount(
#     fund_me: VyperContract, mock_erc20: VyperContract, funder_account: str
# ):
#     """
#     Test ZK token funding with insufficient amount (less than MINIMUM_FUNDING_AMOUNT).
#     """
#     amount = MINIMUM_FUNDING_AMOUNT_WEI - 1  # Use the ETH minimum for ZK too
#     # Mint some tokens to the funder's account for testing
#     mock_erc20.mint(funder_account, amount * 2, sender=mock_erc20.owner())
#     mock_erc20.approve(fund_me.address, amount, sender=funder_account)

#     with pytest.raises(VyperException) as excinfo:
#         fund_me.fund_zk_token(amount, sender=funder_account)
#     assert "fund_me: insufficient amount sent" in str(excinfo.value)


# def test_fund_zk_token_insufficient_allowance(
#     fund_me: VyperContract, mock_erc20: VyperContract, funder_account: str, owner: str
# ):
#     """
#     Test ZK token funding when contract has insufficient allowance.
#     """
#     amount = 100 * 10**ZK_DECIMALS
#     # Mint some tokens to the funder's account for testing
#     mock_erc20.mint(funder_account, amount * 2, sender=owner)
#     # Approve less than the required amount
#     mock_erc20.approve(fund_me.address, amount - 1, sender=funder_account)

#     with pytest.raises(VyperException) as excinfo:
#         fund_me.fund_zk_token(amount, sender=funder_account)
#     assert "ERC20: insufficient allowance" in str(excinfo.value)


# def test_withdraw_eth_success(
#     fund_me: VyperContract, owner: str, funder_account: str, accounts: list[str]
# ):
#     """
#     Test successful ETH withdrawal by the owner.
#     """
#     initial_fund_amount = MINIMUM_FUNDING_AMOUNT_WEI * 5
#     fund_me.fund_eth(sender=funder_account, value=initial_fund_amount)
#     assert fund_me.balance_of_eth() == initial_fund_amount

#     withdraw_amount = MINIMUM_FUNDING_AMOUNT_WEI * 2
#     initial_owner_eth_balance = accounts.get_balance(
#         owner
#     )  # Get owner's actual ETH balance

#     fund_me.withdraw_eth(withdraw_amount, sender=owner)

#     # Assert contract balance decreased
#     assert fund_me.balance_of_eth() == initial_fund_amount - withdraw_amount
#     # Assert owner's ETH balance increased (approximately, accounting for gas)
#     assert (
#         accounts.get_balance(owner) > initial_owner_eth_balance
#     )  # Check if balance increased

#     # Test event emission
#     events = fund_me.get_events("WithdrawEth")
#     assert len(events) == 1
#     assert events[0].to == owner
#     assert events[0].amount == withdraw_amount


# def test_withdraw_eth_not_owner(fund_me: VyperContract, funder_account: str):
#     """
#     Test ETH withdrawal by a non-owner.
#     """
#     fund_me.fund_eth(sender=funder_account, value=MINIMUM_FUNDING_AMOUNT_WEI * 5)
#     with pytest.raises(VyperException) as excinfo:
#         fund_me.withdraw_eth(MINIMUM_FUNDING_AMOUNT_WEI, sender=funder_account)
#     assert "Only the owner can call this function." in str(
#         excinfo.value
#     )  # From ownable module


# def test_withdraw_eth_exceeds_balance(fund_me: VyperContract, owner: str):
#     """
#     Test ETH withdrawal exceeding contract balance.
#     """
#     fund_me.fund_eth(
#         sender=owner, value=MINIMUM_FUNDING_AMOUNT_WEI * 2
#     )  # Fund some ETH
#     with pytest.raises(VyperException) as excinfo:
#         fund_me.withdraw_eth(fund_me.balance_of_eth() + 1, sender=owner)
#     assert "fund_me: amount exceeds balance" in str(excinfo.value)


# def test_withdraw_eth_zero_amount(fund_me: VyperContract, owner: str):
#     """
#     Test ETH withdrawal with zero amount.
#     """
#     fund_me.fund_eth(
#         sender=owner, value=MINIMUM_FUNDING_AMOUNT_WEI * 2
#     )  # Fund some ETH
#     with pytest.raises(VyperException) as excinfo:
#         fund_me.withdraw_eth(0, sender=owner)
#     assert "fund_me: insufficient amount sent" in str(excinfo.value)


# def test_withdraw_zk_token_success(
#     fund_me: VyperContract, mock_erc20: VyperContract, funder_account: str, owner: str
# ):
#     """
#     Test successful ZK token withdrawal by the owner.
#     """
#     initial_fund_amount = 100 * 10**ZK_DECIMALS
#     mock_erc20.mint(funder_account, initial_fund_amount * 2, sender=owner)
#     mock_erc20.approve(fund_me.address, initial_fund_amount, sender=funder_account)
#     fund_me.fund_zk_token(initial_fund_amount, sender=funder_account)
#     assert fund_me.balance_of_zk_token() == initial_fund_amount

#     withdraw_amount = 50 * 10**ZK_DECIMALS
#     initial_owner_zk_balance = mock_erc20.balanceOf(owner)

#     fund_me.withdraw_zk_token(withdraw_amount, sender=owner)

#     # Assert contract ZK balance decreased
#     assert fund_me.balance_of_zk_token() == initial_fund_amount - withdraw_amount
#     # Assert owner's ZK balance increased
#     assert mock_erc20.balanceOf(owner) == initial_owner_zk_balance + withdraw_amount

#     # Test event emission
#     events = fund_me.get_events("WithdrawZK")
#     assert len(events) == 1
#     assert events[0].to == owner
#     assert events[0].amount == withdraw_amount


# def test_withdraw_zk_token_not_owner(
#     fund_me: VyperContract, mock_erc20: VyperContract, funder_account: str, owner: str
# ):
#     """
#     Test ZK token withdrawal by a non-owner.
#     """
#     initial_fund_amount = 100 * 10**ZK_DECIMALS
#     mock_erc20.mint(funder_account, initial_fund_amount * 2, sender=owner)
#     mock_erc20.approve(fund_me.address, initial_fund_amount, sender=funder_account)
#     fund_me.fund_zk_token(initial_fund_amount, sender=funder_account)

#     with pytest.raises(VyperException) as excinfo:
#         fund_me.withdraw_zk_token(50 * 10**ZK_DECIMALS, sender=funder_account)
#     assert "Only the owner can call this function." in str(excinfo.value)


# def test_withdraw_zk_token_exceeds_balance(
#     fund_me: VyperContract, owner: str, mock_erc20: VyperContract
# ):
#     """
#     Test ZK token withdrawal exceeding contract balance.
#     """
#     initial_fund_amount = 100 * 10**ZK_DECIMALS
#     mock_erc20.mint(owner, initial_fund_amount * 2, sender=owner)  # Mint to owner
#     mock_erc20.approve(fund_me.address, initial_fund_amount, sender=owner)
#     fund_me.fund_zk_token(initial_fund_amount, sender=owner)

#     with pytest.raises(VyperException) as excinfo:
#         fund_me.withdraw_zk_token(fund_me.balance_of_zk_token() + 1, sender=owner)
#     assert "fund_me: amount exceeds balance" in str(excinfo.value)


# def test_withdraw_zk_token_zero_amount(
#     fund_me: VyperContract, owner: str, mock_erc20: VyperContract
# ):
#     """
#     Test ZK token withdrawal with zero amount.
#     """
#     initial_fund_amount = 100 * 10**ZK_DECIMALS
#     mock_erc20.mint(owner, initial_fund_amount * 2, sender=owner)
#     mock_erc20.approve(fund_me.address, initial_fund_amount, sender=owner)
#     fund_me.fund_zk_token(initial_fund_amount, sender=owner)

#     with pytest.raises(VyperException) as excinfo:
#         fund_me.withdraw_zk_token(0, sender=owner)
#     assert "fund_me: insufficient amount sent" in str(excinfo.value)


# def test_multiple_funders(
#     fund_me: VyperContract,
#     mock_erc20: VyperContract,
#     funder_account: str,
#     another_funder_account: str,
#     owner: str,
# ):
#     """
#     Test funding from multiple accounts and verify funder count.
#     """
#     eth_amount_1 = MINIMUM_FUNDING_AMOUNT_WEI * 2
#     zk_amount_1 = 50 * 10**ZK_DECIMALS

#     eth_amount_2 = MINIMUM_FUNDING_AMOUNT_WEI * 3
#     zk_amount_2 = 75 * 10**ZK_DECIMALS

#     # Funder 1 funds ETH
#     fund_me.fund_eth(sender=funder_account, value=eth_amount_1)
#     assert fund_me.funder_count() == 1
#     assert fund_me.get_funder_eth_amount(funder_account) == eth_amount_1
#     assert fund_me.get_funder_zk_token_amount(funder_account) == 0

#     # Funder 2 funds ETH
#     fund_me.fund_eth(sender=another_funder_account, value=eth_amount_2)
#     assert fund_me.funder_count() == 2
#     assert fund_me.get_funder_eth_amount(another_funder_account) == eth_amount_2
#     assert fund_me.get_funder_zk_token_amount(another_funder_account) == 0

#     # Funder 1 funds ZK tokens
#     mock_erc20.mint(funder_account, zk_amount_1 * 2, sender=owner)
#     mock_erc20.approve(fund_me.address, zk_amount_1, sender=funder_account)
#     fund_me.fund_zk_token(zk_amount_1, sender=funder_account)
#     assert fund_me.funder_count() == 2  # Still 2 distinct funders
#     assert fund_me.get_funder_eth_amount(funder_account) == eth_amount_1
#     assert fund_me.get_funder_zk_token_amount(funder_account) == zk_amount_1

#     # Funder 2 funds ZK tokens
#     mock_erc20.mint(another_funder_account, zk_amount_2 * 2, sender=owner)
#     mock_erc20.approve(fund_me.address, zk_amount_2, sender=another_funder_account)
#     fund_me.fund_zk_token(zk_amount_2, sender=another_funder_account)
#     assert fund_me.funder_count() == 2  # Still 2 distinct funders
#     assert fund_me.get_funder_eth_amount(another_funder_account) == eth_amount_2
#     assert fund_me.get_funder_zk_token_amount(another_funder_account) == zk_amount_2

#     # Verify total balances
#     assert fund_me.balance_of_eth() == eth_amount_1 + eth_amount_2
#     assert fund_me.balance_of_zk_token() == zk_amount_1 + zk_amount_2


# def test_is_funder_internal_function(
#     fund_me: VyperContract,
#     funder_account: str,
#     another_funder_account: str,
#     owner: str,
#     mock_erc20: VyperContract,
# ):
#     """
#     Test the internal _is_funder logic.
#     """
#     # Initially, no one is a funder
#     assert fund_me._is_funder(funder_account) == False
#     assert fund_me._is_funder(another_funder_account) == False

#     # Funder 1 funds ETH
#     fund_me.fund_eth(sender=funder_account, value=MINIMUM_FUNDING_AMOUNT_WEI + 1)
#     assert fund_me._is_funder(funder_account) == True
#     assert fund_me._is_funder(another_funder_account) == False

#     # Funder 2 funds ZK tokens
#     zk_amount = 10 * 10**ZK_DECIMALS
#     mock_erc20.mint(another_funder_account, zk_amount * 2, sender=owner)
#     mock_erc20.approve(fund_me.address, zk_amount, sender=another_funder_account)
#     fund_me.fund_zk_token(zk_amount, sender=another_funder_account)
#     assert fund_me._is_funder(funder_account) == True
#     assert fund_me._is_funder(another_funder_account) == True

#     # If an account has funded 0 ETH and 0 ZK, it should not be a funder
#     assert fund_me._is_funder(owner) == False  # Assuming owner hasn't funded
