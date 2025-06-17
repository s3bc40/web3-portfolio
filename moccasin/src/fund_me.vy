# pragma version 0.4.1
"""
@license MIT
@title Portfolio Fund Me
@notice A simple contract to fund a portfolio.
@dev This contract allows users to fund a portfolio with ZK tokens.
@author s3bc40
"""
################################################################
#                           IMPORTS                            #
################################################################
# @dev Import the ownable module for ownership functionality.
from snekmate.auth import ownable

initializes: ownable
exports: ownable.owner

# @dev Import interfaces for ERC20 tokens.
from ethereum.ercs import IERC20

################################################################
#                            ERRORS                            #
################################################################
# @dev Zero address error message.
ZERO_ADDRESS_ERROR: public(
    constant(String[64])
) = "fund_me: zero address not allowed"

# @dev Insufficient amount error message.
INSUFFICIENT_AMOUNT_ERROR: public(
    constant(String[64])
) = "fund_me: insufficient amount sent"

# @dev Funding transfer failed error message.
FUNDING_TRANSFER_FAILED_ERROR: public(
    constant(String[64])
) = "fund_me: funding transfer failed"

# @dev Direct ETH transfer error message.
DIRECT_TRANSFER_ERROR: public(
    constant(String[64])
) = "fund_me: direct transfers not allowed"

# @dev Withdrawal amount exceeds balance error message.
WITHDRAWAL_AMOUNT_EXCEEDS_BALANCE_ERROR: public(
    constant(String[64])
) = "fund_me: withdrawal amount exceeds balance"


################################################################
#                            EVENTS                            #
################################################################
# @dev Events to log funding ETH.
event FundedETH:
    funder: indexed(address)
    amount: uint256


# @dev Events to log funding ZK tokens.
event FundedZKToken:
    funder: indexed(address)
    amount: uint256


# @dev Events to log withdrawals of ETH.
event WithdrawEth:
    to: indexed(address)
    amount: uint256


# @dev Events to log withdrawals of ZK tokens.
event WithdrawZK:
    to: indexed(address)
    amount: uint256


################################################################
#                    CONSTANTS & IMMUTABLES                    #
################################################################
# @dev The minimum funding amount in wei (0.0001 ETH).
MINIMUM_FUNDING_AMOUNT_WEI: constant(uint256) = 1 * 10**14

################################################################
#                       STATE VARIABLES                        #
################################################################
# @dev Total amount of ETH in the contract in wei available for withdrawal.
balance_of_eth: public(uint256)
# @dev Total amount of ZK tokens in the contract in wei available for withdrawal.
balance_of_zk_token: public(uint256)

# @dev Total amount of funder in the contract.
#     Allows to track the number of funders.
funder_count: public(uint256)

# @dev ETH funded by each funder.
#    Allows to track the amount funded by each address and display it.
# @notice It is meant as an historical record of ETH contributions, not transfers.
funder_to_eth_funded: HashMap[address, uint256]

# @dev ZK tokens funded by each funder.
#    Allows to track the amount funded by each address and display it.
# @notice It is meant as an historical record of ZK token contributions, not transfers.
funder_to_zk_funded: HashMap[address, uint256]

# @dev The address of the ZK token contract.
zk_token_address: address

################################################################
#                    CONSTRUCTOR & FALLBACK                    #
################################################################
@deploy
def __init__(_zk_token_address: address):
    """
    @dev Initializes the contract with the owner (msg.sender) and sets the ZK token address.
    @param zk_token_address The address of the ZK token contract.
    """
    assert _zk_token_address != empty(address), ZERO_ADDRESS_ERROR
    ownable.__init__()
    self.balance_of_eth = 0
    self.balance_of_zk_token = 0
    self.funder_count = 0
    self.zk_token_address = _zk_token_address


@payable
@external
def __default__():
    """
    @dev Fallback function to handle direct ETH transfers.
    """
    raise DIRECT_TRANSFER_ERROR


################################################################
#                      EXTERNAL FUNCTIONS                      #
################################################################
@nonreentrant
@payable
@external
def fund_eth():
    """
    @dev Function to fund the contract with ETH (in wei).
    @notice This function allows users to send ETH to the contract.
        The function is marked as `nonreentrant` to prevent reentrancy attacks.
        The function is marked as `payable` to allow ETH transfers.
    """
    assert msg.sender != empty(address), ZERO_ADDRESS_ERROR
    assert msg.value >= MINIMUM_FUNDING_AMOUNT_WEI, INSUFFICIENT_AMOUNT_ERROR
    amount: uint256 = msg.value

    # Increment the total fund amount if this is the first funding from the address.
    if self._is_funder(msg.sender) == False:
        self.funder_count += 1
    self.funder_to_eth_funded[msg.sender] += amount
    self.balance_of_eth += amount

    # Log the funding event.
    log FundedETH(funder=msg.sender, amount=amount)


@nonreentrant
@external
def fund_zk_token(_amount: uint256):
    """
    @dev Function to fund the contract with ZK tokens (in wei).
    @param _amount The amount of ZK tokens to be funded.
    @notice This function allows users to send ZK tokens to the contract.
        The function is marked as `nonreentrant` to prevent reentrancy attacks.
        The sender must have approved the contract to spend the specified amount of ZK tokens.
    """
    assert msg.sender != empty(address), ZERO_ADDRESS_ERROR
    assert _amount >= MINIMUM_FUNDING_AMOUNT_WEI, INSUFFICIENT_AMOUNT_ERROR

    # Increment the total fund amount if this is the first funding from the address.
    if self._is_funder(msg.sender) == False:
        self.funder_count += 1
    self.funder_to_zk_funded[msg.sender] += _amount
    self.balance_of_zk_token += _amount

    # Transfer the ZK tokens from the sender to the contract.
    success: bool = extcall IERC20(self.zk_token_address).transferFrom(
        msg.sender, self, _amount
    )
    assert success, FUNDING_TRANSFER_FAILED_ERROR

    # Log the funding event.
    log FundedZKToken(funder=msg.sender, amount=_amount)


@nonreentrant
@external
def withdraw_eth(_amount: uint256):
    """
    @dev Function to withdraw ETH from the contract.
    @param _amount The amount of ETH to withdraw (in wei).
    @notice This function allows the owner to withdraw ETH from the contract.
        The function is marked as `nonreentrant` to prevent reentrancy attacks.
    """
    ownable._check_owner()
    assert (
        _amount <= self.balance_of_eth
    ), WITHDRAWAL_AMOUNT_EXCEEDS_BALANCE_ERROR
    assert _amount > 0, INSUFFICIENT_AMOUNT_ERROR

    # Update the balance before transferring to prevent reentrancy issues.
    self.balance_of_eth -= _amount

    # Transfer the specified amount of ETH to the owner.
    success: bool = raw_call(
        ownable.owner, b"", value=_amount, revert_on_failure=False
    )
    assert success, FUNDING_TRANSFER_FAILED_ERROR

    # Log the withdrawal event.
    log WithdrawEth(to=ownable.owner, amount=_amount)


@nonreentrant
@external
def withdraw_zk_token(_amount: uint256):
    """
    @dev Function to withdraw ZK tokens from the contract.
    @param _amount The amount of ZK tokens to withdraw (in wei).
    @notice This function allows the owner to withdraw ZK tokens from the contract.
        The function is marked as `nonreentrant` to prevent reentrancy attacks.
    """
    ownable._check_owner()
    assert (
        _amount <= self.balance_of_zk_token
    ), WITHDRAWAL_AMOUNT_EXCEEDS_BALANCE_ERROR
    assert _amount > 0, INSUFFICIENT_AMOUNT_ERROR

    # Update the balance before transferring to prevent reentrancy issues.
    self.balance_of_zk_token -= _amount

    # Transfer the specified amount of ZK tokens to the owner.
    success: bool = extcall IERC20(self.zk_token_address).transfer(
        ownable.owner, _amount
    )
    assert success, FUNDING_TRANSFER_FAILED_ERROR

    # Log the withdrawal event.
    log WithdrawZK(to=ownable.owner, amount=_amount)


@external
def set_zk_token_address(_zk_token_address: address):
    """
    @dev Function to set the ZK token address.
    @param _zk_token_address The new address of the ZK token contract.
    @notice This function allows the owner to update the ZK token address.
    """
    ownable._check_owner()
    assert _zk_token_address != empty(address), ZERO_ADDRESS_ERROR
    self.zk_token_address = _zk_token_address


################################################################
#                      INTERNAL FUNCTIONS                      #
################################################################
@internal
def _is_funder(funder: address) -> bool:
    """
    @dev Checks if an address is a funder.
    @param funder The address to check.
    @return True if the address is a funder, False otherwise.
    """
    return (
        self.funder_to_eth_funded[funder] > 0
        or self.funder_to_zk_funded[funder] > 0
    )


################################################################
#                        VIEW FUNCTIONS                        #
################################################################
@view
@external
def get_funder_eth_amount(funder: address) -> uint256:
    """
    @dev Returns the amount of ETH funded by a specific address.
    @param funder The address of the funder.
    @return The amount of ETH funded by the specified address.
    """
    return self.funder_to_eth_funded[funder]


@view
@external
def get_funder_zk_token_amount(funder: address) -> uint256:
    """
    @dev Returns the amount of ZK tokens funded by a specific address.
    @param funder The address of the funder.
    @return The amount of ZK tokens funded by the specified address.
    """
    return self.funder_to_zk_funded[funder]


@view
@external
def get_minimal_funding_amount() -> uint256:
    """
    @dev Returns the minimum funding amount in wei.
    @return The minimum funding amount in wei.
    """
    return MINIMUM_FUNDING_AMOUNT_WEI


@view
@external
def get_zk_token_address() -> address:
    """
    @dev Returns the address of the ZK token contract.
    @return The address of the ZK token contract.
    """
    return self.zk_token_address
