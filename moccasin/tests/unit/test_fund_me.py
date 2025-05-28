import pytest
from titanoboa.exceptions import VyperException
from moccasin.boa_tools import VyperContract
from utils.constants import (
    MINIMUM_FUNDING_AMOUNT_WEI,
    ZK_INITIAL_SUPPLY,
    ZK_NAME,
    ZK_SYMBOL,
    ZK_DECIMALS,
)

# Assuming MINIMUM_FUNDING_AMOUNT is imported from your constants,
# it's good practice to rename it for clarity if it represents wei value.
# For example: MINIMUM_FUNDING_AMOUNT_WEI = 100000000000000 # 0.0001 ETH in wei
# WIP


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


def test_fallback_rejects_direct_eth_transfer(
    fund_me: VyperContract, accounts: list[str]
):
    """
    Test that direct ETH transfers to the contract are rejected by the fallback.
    """
    with pytest.raises(VyperException) as excinfo:
        fund_me.transfer(accounts[0], 100)  # Attempt a direct transfer
    assert "fund_me: direct transfers not allowed" in str(excinfo.value)


def test_fund_eth_success(fund_me: VyperContract, funder_account: str):
    """
    Test successful ETH funding.
    """
    amount = MINIMUM_FUNDING_AMOUNT_WEI + 100
    initial_contract_eth_balance = fund_me.balance_of_eth()
    initial_funder_eth_balance = fund_me.get_funder_eth_amount(funder_account)

    # Fund ETH
    fund_me.fund_eth(sender=funder_account, value=amount)

    # Assert contract balance increased
    assert fund_me.balance_of_eth() == initial_contract_eth_balance + amount
    # Assert funder's recorded balance increased
    assert (
        fund_me.get_funder_eth_amount(funder_account)
        == initial_funder_eth_balance + amount
    )
    # Assert funder count increased if new funder
    assert fund_me.funder_count() == 1

    # Test event emission
    events = fund_me.get_events("FundedETH")
    assert len(events) == 1
    assert events[0].funder == funder_account
    assert events[0].amount == amount

    # Fund ETH again from the same funder
    fund_me.fund_eth(sender=funder_account, value=amount)
    assert fund_me.balance_of_eth() == initial_contract_eth_balance + (2 * amount)
    assert fund_me.get_funder_eth_amount(
        funder_account
    ) == initial_funder_eth_balance + (2 * amount)
    assert fund_me.funder_count() == 1  # Still 1 funder


def test_fund_eth_insufficient_amount(fund_me: VyperContract, funder_account: str):
    """
    Test ETH funding with insufficient amount.
    """
    amount = MINIMUM_FUNDING_AMOUNT_WEI - 1
    with pytest.raises(VyperException) as excinfo:
        fund_me.fund_eth(sender=funder_account, value=amount)
    assert "fund_me: insufficient amount sent" in str(excinfo.value)


def test_fund_eth_zero_address(fund_me: VyperContract, accounts: list[str]):
    """
    Test ETH funding from a zero address (should not be possible directly, but good to check assertion).
    """
    with pytest.raises(VyperException) as excinfo:
        fund_me.fund_eth(
            sender=accounts[0],
            value=MINIMUM_FUNDING_AMOUNT_WEI + 1,
            account_as_sender=False,
        )  # This is a conceptual check, as msg.sender cannot be zero_address in a real tx
    assert "fund_me: zero address not allowed" in str(excinfo.value)


def test_fund_zk_token_success(
    fund_me: VyperContract, mock_erc20: VyperContract, funder_account: str, owner: str
):
    """
    Test successful ZK token funding.
    """
    amount = 100 * 10**ZK_DECIMALS  # 100 ZK tokens
    # Mint some tokens to the funder's account for testing
    mock_erc20.mint(
        funder_account, amount * 2, sender=owner
    )  # Mint more than needed for allowance and transfer
    assert mock_erc20.balanceOf(funder_account) >= amount, (
        "Funder should have enough ZK tokens"
    )

    # Approve the fund_me contract to spend ZK tokens
    mock_erc20.approve(fund_me.address, amount, sender=funder_account)
    assert mock_erc20.allowance(funder_account, fund_me.address) == amount, (
        "Allowance should be set"
    )

    initial_contract_zk_balance = fund_me.balance_of_zk_token()
    initial_funder_zk_balance = fund_me.get_funder_zk_token_amount(funder_account)
    initial_funder_erc20_balance = mock_erc20.balanceOf(funder_account)

    # Fund ZK tokens
    fund_me.fund_zk_token(amount, sender=funder_account)

    # Assert contract ZK balance increased
    assert fund_me.balance_of_zk_token() == initial_contract_zk_balance + amount
    # Assert funder's recorded ZK balance increased
    assert (
        fund_me.get_funder_zk_token_amount(funder_account)
        == initial_funder_zk_balance + amount
    )
    # Assert funder's ERC20 balance decreased
    assert mock_erc20.balanceOf(funder_account) == initial_funder_erc20_balance - amount
    # Assert funder count increased if new funder
    assert fund_me.funder_count() == 1

    # Test event emission
    events = fund_me.get_events("FundedZKToken")
    assert len(events) == 1
    assert events[0].funder == funder_account
    assert events[0].amount == amount

    # Fund ZK again from the same funder
    mock_erc20.approve(
        fund_me.address, amount, sender=funder_account
    )  # Approve again for the second transfer
    fund_me.fund_zk_token(amount, sender=funder_account)
    assert fund_me.balance_of_zk_token() == initial_contract_zk_balance + (2 * amount)
    assert fund_me.get_funder_zk_token_amount(
        funder_account
    ) == initial_funder_zk_balance + (2 * amount)
    assert fund_me.funder_count() == 1  # Still 1 funder


def test_fund_zk_token_insufficient_amount(
    fund_me: VyperContract, mock_erc20: VyperContract, funder_account: str
):
    """
    Test ZK token funding with insufficient amount (less than MINIMUM_FUNDING_AMOUNT).
    """
    amount = MINIMUM_FUNDING_AMOUNT_WEI - 1  # Use the ETH minimum for ZK too
    # Mint some tokens to the funder's account for testing
    mock_erc20.mint(funder_account, amount * 2, sender=mock_erc20.owner())
    mock_erc20.approve(fund_me.address, amount, sender=funder_account)

    with pytest.raises(VyperException) as excinfo:
        fund_me.fund_zk_token(amount, sender=funder_account)
    assert "fund_me: insufficient amount sent" in str(excinfo.value)


def test_fund_zk_token_insufficient_allowance(
    fund_me: VyperContract, mock_erc20: VyperContract, funder_account: str, owner: str
):
    """
    Test ZK token funding when contract has insufficient allowance.
    """
    amount = 100 * 10**ZK_DECIMALS
    # Mint some tokens to the funder's account for testing
    mock_erc20.mint(funder_account, amount * 2, sender=owner)
    # Approve less than the required amount
    mock_erc20.approve(fund_me.address, amount - 1, sender=funder_account)

    with pytest.raises(VyperException) as excinfo:
        fund_me.fund_zk_token(amount, sender=funder_account)
    assert "ERC20: insufficient allowance" in str(excinfo.value)


def test_withdraw_eth_success(
    fund_me: VyperContract, owner: str, funder_account: str, accounts: list[str]
):
    """
    Test successful ETH withdrawal by the owner.
    """
    initial_fund_amount = MINIMUM_FUNDING_AMOUNT_WEI * 5
    fund_me.fund_eth(sender=funder_account, value=initial_fund_amount)
    assert fund_me.balance_of_eth() == initial_fund_amount

    withdraw_amount = MINIMUM_FUNDING_AMOUNT_WEI * 2
    initial_owner_eth_balance = accounts.get_balance(
        owner
    )  # Get owner's actual ETH balance

    fund_me.withdraw_eth(withdraw_amount, sender=owner)

    # Assert contract balance decreased
    assert fund_me.balance_of_eth() == initial_fund_amount - withdraw_amount
    # Assert owner's ETH balance increased (approximately, accounting for gas)
    assert (
        accounts.get_balance(owner) > initial_owner_eth_balance
    )  # Check if balance increased

    # Test event emission
    events = fund_me.get_events("WithdrawEth")
    assert len(events) == 1
    assert events[0].to == owner
    assert events[0].amount == withdraw_amount


def test_withdraw_eth_not_owner(fund_me: VyperContract, funder_account: str):
    """
    Test ETH withdrawal by a non-owner.
    """
    fund_me.fund_eth(sender=funder_account, value=MINIMUM_FUNDING_AMOUNT_WEI * 5)
    with pytest.raises(VyperException) as excinfo:
        fund_me.withdraw_eth(MINIMUM_FUNDING_AMOUNT_WEI, sender=funder_account)
    assert "Only the owner can call this function." in str(
        excinfo.value
    )  # From ownable module


def test_withdraw_eth_exceeds_balance(fund_me: VyperContract, owner: str):
    """
    Test ETH withdrawal exceeding contract balance.
    """
    fund_me.fund_eth(
        sender=owner, value=MINIMUM_FUNDING_AMOUNT_WEI * 2
    )  # Fund some ETH
    with pytest.raises(VyperException) as excinfo:
        fund_me.withdraw_eth(fund_me.balance_of_eth() + 1, sender=owner)
    assert "fund_me: amount exceeds balance" in str(excinfo.value)


def test_withdraw_eth_zero_amount(fund_me: VyperContract, owner: str):
    """
    Test ETH withdrawal with zero amount.
    """
    fund_me.fund_eth(
        sender=owner, value=MINIMUM_FUNDING_AMOUNT_WEI * 2
    )  # Fund some ETH
    with pytest.raises(VyperException) as excinfo:
        fund_me.withdraw_eth(0, sender=owner)
    assert "fund_me: insufficient amount sent" in str(excinfo.value)


def test_withdraw_zk_token_success(
    fund_me: VyperContract, mock_erc20: VyperContract, funder_account: str, owner: str
):
    """
    Test successful ZK token withdrawal by the owner.
    """
    initial_fund_amount = 100 * 10**ZK_DECIMALS
    mock_erc20.mint(funder_account, initial_fund_amount * 2, sender=owner)
    mock_erc20.approve(fund_me.address, initial_fund_amount, sender=funder_account)
    fund_me.fund_zk_token(initial_fund_amount, sender=funder_account)
    assert fund_me.balance_of_zk_token() == initial_fund_amount

    withdraw_amount = 50 * 10**ZK_DECIMALS
    initial_owner_zk_balance = mock_erc20.balanceOf(owner)

    fund_me.withdraw_zk_token(withdraw_amount, sender=owner)

    # Assert contract ZK balance decreased
    assert fund_me.balance_of_zk_token() == initial_fund_amount - withdraw_amount
    # Assert owner's ZK balance increased
    assert mock_erc20.balanceOf(owner) == initial_owner_zk_balance + withdraw_amount

    # Test event emission
    events = fund_me.get_events("WithdrawZK")
    assert len(events) == 1
    assert events[0].to == owner
    assert events[0].amount == withdraw_amount


def test_withdraw_zk_token_not_owner(
    fund_me: VyperContract, mock_erc20: VyperContract, funder_account: str, owner: str
):
    """
    Test ZK token withdrawal by a non-owner.
    """
    initial_fund_amount = 100 * 10**ZK_DECIMALS
    mock_erc20.mint(funder_account, initial_fund_amount * 2, sender=owner)
    mock_erc20.approve(fund_me.address, initial_fund_amount, sender=funder_account)
    fund_me.fund_zk_token(initial_fund_amount, sender=funder_account)

    with pytest.raises(VyperException) as excinfo:
        fund_me.withdraw_zk_token(50 * 10**ZK_DECIMALS, sender=funder_account)
    assert "Only the owner can call this function." in str(excinfo.value)


def test_withdraw_zk_token_exceeds_balance(
    fund_me: VyperContract, owner: str, mock_erc20: VyperContract
):
    """
    Test ZK token withdrawal exceeding contract balance.
    """
    initial_fund_amount = 100 * 10**ZK_DECIMALS
    mock_erc20.mint(owner, initial_fund_amount * 2, sender=owner)  # Mint to owner
    mock_erc20.approve(fund_me.address, initial_fund_amount, sender=owner)
    fund_me.fund_zk_token(initial_fund_amount, sender=owner)

    with pytest.raises(VyperException) as excinfo:
        fund_me.withdraw_zk_token(fund_me.balance_of_zk_token() + 1, sender=owner)
    assert "fund_me: amount exceeds balance" in str(excinfo.value)


def test_withdraw_zk_token_zero_amount(
    fund_me: VyperContract, owner: str, mock_erc20: VyperContract
):
    """
    Test ZK token withdrawal with zero amount.
    """
    initial_fund_amount = 100 * 10**ZK_DECIMALS
    mock_erc20.mint(owner, initial_fund_amount * 2, sender=owner)
    mock_erc20.approve(fund_me.address, initial_fund_amount, sender=owner)
    fund_me.fund_zk_token(initial_fund_amount, sender=owner)

    with pytest.raises(VyperException) as excinfo:
        fund_me.withdraw_zk_token(0, sender=owner)
    assert "fund_me: insufficient amount sent" in str(excinfo.value)


def test_multiple_funders(
    fund_me: VyperContract,
    mock_erc20: VyperContract,
    funder_account: str,
    another_funder_account: str,
    owner: str,
):
    """
    Test funding from multiple accounts and verify funder count.
    """
    eth_amount_1 = MINIMUM_FUNDING_AMOUNT_WEI * 2
    zk_amount_1 = 50 * 10**ZK_DECIMALS

    eth_amount_2 = MINIMUM_FUNDING_AMOUNT_WEI * 3
    zk_amount_2 = 75 * 10**ZK_DECIMALS

    # Funder 1 funds ETH
    fund_me.fund_eth(sender=funder_account, value=eth_amount_1)
    assert fund_me.funder_count() == 1
    assert fund_me.get_funder_eth_amount(funder_account) == eth_amount_1
    assert fund_me.get_funder_zk_token_amount(funder_account) == 0

    # Funder 2 funds ETH
    fund_me.fund_eth(sender=another_funder_account, value=eth_amount_2)
    assert fund_me.funder_count() == 2
    assert fund_me.get_funder_eth_amount(another_funder_account) == eth_amount_2
    assert fund_me.get_funder_zk_token_amount(another_funder_account) == 0

    # Funder 1 funds ZK tokens
    mock_erc20.mint(funder_account, zk_amount_1 * 2, sender=owner)
    mock_erc20.approve(fund_me.address, zk_amount_1, sender=funder_account)
    fund_me.fund_zk_token(zk_amount_1, sender=funder_account)
    assert fund_me.funder_count() == 2  # Still 2 distinct funders
    assert fund_me.get_funder_eth_amount(funder_account) == eth_amount_1
    assert fund_me.get_funder_zk_token_amount(funder_account) == zk_amount_1

    # Funder 2 funds ZK tokens
    mock_erc20.mint(another_funder_account, zk_amount_2 * 2, sender=owner)
    mock_erc20.approve(fund_me.address, zk_amount_2, sender=another_funder_account)
    fund_me.fund_zk_token(zk_amount_2, sender=another_funder_account)
    assert fund_me.funder_count() == 2  # Still 2 distinct funders
    assert fund_me.get_funder_eth_amount(another_funder_account) == eth_amount_2
    assert fund_me.get_funder_zk_token_amount(another_funder_account) == zk_amount_2

    # Verify total balances
    assert fund_me.balance_of_eth() == eth_amount_1 + eth_amount_2
    assert fund_me.balance_of_zk_token() == zk_amount_1 + zk_amount_2


def test_is_funder_internal_function(
    fund_me: VyperContract,
    funder_account: str,
    another_funder_account: str,
    owner: str,
    mock_erc20: VyperContract,
):
    """
    Test the internal _is_funder logic.
    """
    # Initially, no one is a funder
    assert fund_me._is_funder(funder_account) == False
    assert fund_me._is_funder(another_funder_account) == False

    # Funder 1 funds ETH
    fund_me.fund_eth(sender=funder_account, value=MINIMUM_FUNDING_AMOUNT_WEI + 1)
    assert fund_me._is_funder(funder_account) == True
    assert fund_me._is_funder(another_funder_account) == False

    # Funder 2 funds ZK tokens
    zk_amount = 10 * 10**ZK_DECIMALS
    mock_erc20.mint(another_funder_account, zk_amount * 2, sender=owner)
    mock_erc20.approve(fund_me.address, zk_amount, sender=another_funder_account)
    fund_me.fund_zk_token(zk_amount, sender=another_funder_account)
    assert fund_me._is_funder(funder_account) == True
    assert fund_me._is_funder(another_funder_account) == True

    # If an account has funded 0 ETH and 0 ZK, it should not be a funder
    assert fund_me._is_funder(owner) == False  # Assuming owner hasn't funded
