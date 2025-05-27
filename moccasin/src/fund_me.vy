# pragma version 0.4.1
"""
@license MIT
@title Portfolio Fund Me
@notice A simple contract to fund a portfolio.
@author s3bc40
"""
################################################################
#                           IMPORTS                            #
################################################################
from snekmate.auth import ownable
initializes: ownable
exports: ownable.owner

from ethereum.ercs import IERC20

################################################################
#                            ERRORS                            #
################################################################
ZERO_ADDRESS_ERROR: constant(String[64]) = "fund_me: zero address not allowed"
INSUFFICIENT_AMOUNT_ERROR: constant(String[64]) = "fund_me: insufficient amount sent"
MAXIMUM_WHITELIST_SIZE_ERROR: constant(String[64]) = "fund_me: maximum whitelist size reached"


################################################################
#                            EVENTS                            #
################################################################
event Funded:
    funder: indexed(address)
    amount: uint256

event TokenWhitelisted:
    token: indexed(address)

################################################################
#                          CONSTANTS                           #
################################################################
MINIMUM_FUND_AMOUNT: constant(uint256) = as_wei_value(0.001, "ether")

################################################################
#                       STATE VARIABLES                        #
################################################################
total_fund: public(uint256)
funder_count: public(uint256)
funder_to_amount: HashMap[address, uint256]
token_address_whitelist: DynArray[address, 10]

################################################################
#                    CONSTRUCTOR & FALLBACK                    #
################################################################
@deploy
def __init__(token_to_whitelist: DynArray[address, 10]):
    """
    @dev Initializes the contract with the owner (msg.sender).
    """
    ownable.__init__()
    self.total_fund = 0
    self.funder_count = 0
    self.token_address_whitelist = token_to_whitelist


################################################################
#                      EXTERNAL FUNCTIONS                      #
################################################################
@payable
@external
def fund_eth(amount: uint256):
    """
    @dev Internal function to handle ETH funding.
    @param amount The amount of ETH to fund.
    """
    assert amount >= MINIMUM_FUND_AMOUNT, INSUFFICIENT_AMOUNT_ERROR

    self.total_fund += amount
    self.funder_to_amount[msg.sender] += amount
    log Funded(funder = msg.sender, amount = amount)

@external
def fund_erc20(token: address, amount: uint256):
    """
    @dev Internal function to handle ERC20 token funding.
    @param token The address of the ERC20 token contract.
    @param amount The amount of tokens to fund.
    """
    assert amount >= MINIMUM_FUND_AMOUNT, INSUFFICIENT_AMOUNT_ERROR

    erc20: IERC20 = IERC20(token)
    extcall erc20.transferFrom(msg.sender, self, amount)

    self.total_fund += amount
    self.funder_to_amount[msg.sender] += amount
    log Funded(funder = msg.sender, amount = amount)


################################################################
#                      INTERNAL FUNCTIONS                      #
################################################################
@internal
def _add_token_to_whitelist(token: address):
    """
    @dev Internal function to add a token to the whitelist.
    @notice This function can only be called by the owner.
    @param token The address of the token to whitelist.
    """
    ownable._check_owner()
    assert token != empty(address), ZERO_ADDRESS_ERROR
    assert len(self.token_address_whitelist) < 10, MAXIMUM_WHITELIST_SIZE_ERROR
    
    self.token_address_whitelist.append(token)
    log TokenWhitelisted(token = token)

################################################################
#                        VIEW FUNCTIONS                        #
################################################################
@view
@external
def get_amount_from_funder(funder: address) -> uint256:
    """
    @dev Returns the amount funded by a specific address.
    @param funder The address of the funder.
    @return The amount funded by the specified address.
    """
    return self.funder_to_amount[funder]
