import boa
import pytest

from boa.test.strategies import strategy as st_boa
from hypothesis import assume, settings
from hypothesis.stateful import RuleBasedStateMachine, rule, invariant, initialize

from script import deploy_fund_me
from src.mocks import mock_zk_token
from utils.constants import (
    FUNDER_INITIAL_BALANCE_WEI,
    FUZZING_FUNDER_COUNT,
    FUZZING_MAX_FUNDING_AMOUNT_WEI,
    FUZZING_MAX_WITHDRAWAL_AMOUNT_WEI,
    MINIMUM_FUNDING_AMOUNT_WEI,
)


class InvariantTestFundMe(RuleBasedStateMachine):
    """Stateful test for the FundMe contract using Hypothesis."""

    def __init__(self):
        super().__init__()

    # --- Setup the initial state of the test
    @initialize()
    def setup(self):
        """Initialize the FundMe contract and funders.

        This function deploys the FundMe contract and creates a list of funders
        with specified amounts of ETH and ZK token.

        :param amount_wei: The amount of ETH to fund each funder with.
        """
        # Deploy the FundMe contract
        self.fund_me = deploy_fund_me.deploy()
        self.owner: str = self.fund_me.owner()
        # Deploy the mock ZK token
        self.mock_zktoken = mock_zk_token.at(self.fund_me.get_zk_token_address())
        # Create a list of funders with initial balances
        self.funders: list[str] = []
        for i in range(FUZZING_FUNDER_COUNT):
            funder_address: str = boa.env.generate_address(f"funder-{i}")
            # Set the balance of the funder to the specified amount
            boa.env.set_balance(funder_address, FUNDER_INITIAL_BALANCE_WEI)
            self.mock_zktoken.mint(funder_address, FUNDER_INITIAL_BALANCE_WEI)
            # Append the funder address to the list
            self.funders.append(funder_address)

    # --- Funder fund the contract with ETH.
    @rule(
        funder_index=st_boa("uint256", min_value=0, max_value=FUZZING_FUNDER_COUNT - 1),
        amount_wei=st_boa(
            "uint256",
            min_value=MINIMUM_FUNDING_AMOUNT_WEI,
            max_value=FUZZING_MAX_FUNDING_AMOUNT_WEI,
        ),
    )
    def fund_eth(self, funder_index: int, amount_wei: int):
        """Funder funds the contract with ETH.

        This function allows a funder to send a specified amount of ETH to the
        FundMe contract. It assumes that the funder has enough balance to cover
        the funding amount.

        :param funder_index: The index of the funder in the funders list.
        :param amount_wei: The amount of ETH to fund the contract with.
        """
        funder = self.funders[funder_index]
        # Ensure the funder has enough balance to fund the contract
        assume(boa.env.get_balance(funder) >= amount_wei)
        with boa.env.prank(funder):
            self.fund_me.fund_eth(value=amount_wei)

    # --- Funder funds the contract with ZK token
    @rule(
        funder_index=st_boa("uint256", min_value=0, max_value=FUZZING_FUNDER_COUNT - 1),
        amount_wei=st_boa(
            "uint256",
            min_value=MINIMUM_FUNDING_AMOUNT_WEI,
            max_value=FUZZING_MAX_FUNDING_AMOUNT_WEI,
        ),
    )
    def fund_zk_token(self, funder_index: int, amount_wei: int):
        """Funder funds the contract with ZK token.

        This function allows a funder to send a specified amount of ZK token to
        the FundMe contract. It assumes that the funder has enough balance to
        cover the funding amount.

        :param funder_index: The index of the funder in the funders list.
        :param amount_wei: The amount of ZK token to fund the contract with.
        """
        funder = self.funders[funder_index]
        # Ensure the funder has enough balance to fund the contract
        assume(self.mock_zktoken.balanceOf(funder) >= amount_wei)
        with boa.env.prank(funder):
            # Approve the FundMe contract to spend the ZK token
            self.mock_zktoken.approve(self.fund_me.address, amount_wei)
            # Fund the contract with ZK token
            self.fund_me.fund_zk_token(amount_wei)

    # --- Withdraw funds from the contract
    @rule(
        amount_wei=st_boa(
            "uint256",
            min_value=1,
            max_value=FUZZING_MAX_WITHDRAWAL_AMOUNT_WEI,
        )
    )
    def withdraw_eth(self, amount_wei: int):
        """Withdraw ETH from the FundMe contract.

        This function allows the owner of the contract to withdraw a specified
        amount of ETH from the FundMe contract. It assumes that the owner has
        enough balance in the contract to cover the withdrawal amount.

        :param amount_wei: The amount of ETH to withdraw from the contract.
        """
        assume(boa.env.get_balance(self.fund_me.address) >= amount_wei)
        with boa.env.prank(self.owner):
            self.fund_me.withdraw_eth(amount_wei)

    # --- Withdraw ZK token from the contract
    @rule(
        amount_wei=st_boa(
            "uint256",
            min_value=1,
            max_value=FUZZING_MAX_WITHDRAWAL_AMOUNT_WEI,
        )
    )
    def withdraw_zk_token(self, amount_wei: int):
        """Withdraw ZK token from the FundMe contract.

        This function allows the owner of the contract to withdraw a specified
        amount of ZK token from the FundMe contract. It assumes that the owner
        has enough balance in the contract to cover the withdrawal amount.

        :param amount_wei: The amount of ZK token to withdraw from the contract.
        """
        assume(self.mock_zktoken.balanceOf(self.fund_me.address) >= amount_wei)
        with boa.env.prank(self.owner):
            self.fund_me.withdraw_zk_token(amount_wei)

    # --- Balance of ETH in the contract should never exceed the contract's balance
    @invariant()
    def balance_of_eth_should_never_exceed_contract_balance(self):
        """Invariant check to ensure the balance of ETH in the contract never exceeds the contract's balance."""
        contract_balance = boa.env.get_balance(self.fund_me.address)
        computed_balance = self.fund_me.balance_of_eth()
        assert computed_balance <= contract_balance, (
            f"Balance of ETH in the contract ({computed_balance}) exceeds "
            f"the contract's balance ({contract_balance})"
        )

    # --- Balance of ZK token in the contract should never exceed the contract's balance
    @invariant()
    def balance_of_zk_token_should_never_exceed_contract_balance(self):
        """Invariant check to ensure the balance of ZK token in the contract never exceeds the contract's balance."""
        contract_balance = self.mock_zktoken.balanceOf(self.fund_me.address)
        computed_balance = self.fund_me.balance_of_zk_token()
        assert computed_balance <= contract_balance, (
            f"Balance of ZK token in the contract ({computed_balance}) exceeds "
            f"the contract's balance ({contract_balance})"
        )

    # --- Funder count should not be doubled from funding ETH and ZK token
    @invariant()
    def funder_count_should_not_double(self):
        """Invariant check to ensure the funder count does not double from funding ETH and ZK token."""
        # Get the funder count from the contract
        contract_funder_count = self.fund_me.funder_count()
        max_funder_count = len(self.funders)
        assert contract_funder_count <= max_funder_count, (
            f"Funder count in the contract ({contract_funder_count}) exceeds "
            f"the maximum funder count ({max_funder_count})"
        )


# --- Run the stateful test
invariant_test_fund_me = InvariantTestFundMe.TestCase
invariant_test_fund_me.settings = settings(max_examples=256, stateful_step_count=50)
