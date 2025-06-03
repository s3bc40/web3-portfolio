# pragma version 0.4.1
"""
@license MIT
@title Mock ZKsync Token
@notice A mock implementation of the ZKsync token interface for testing purposes.
@dev This contract implements snekmate's ZKsync token interface with ownable functionality.
@author s3bc40
"""
from snekmate.auth import ownable
from snekmate.tokens import erc20

initializes: ownable
initializes: erc20[ownable := ownable]
exports: (
    erc20.balanceOf,
    erc20.approve,
    erc20.totalSupply,
    erc20.transfer,
    erc20.transferFrom,
)


@deploy
def __init__(
    _name: String[25],
    _symbol: String[5],
    _decimals: uint8,
    _initial_supply: uint256,
):
    ownable.__init__()
    erc20.__init__(_name, _symbol, _decimals, "MOCK", "MOCK")
    erc20._mint(msg.sender, _initial_supply)


@external
def mint(
    _to: address,
    _amount: uint256,
):
    """
    @notice Mint tokens to a specified address (Mocking).
    @param _to The address to mint tokens to.
    @param _amount The amount of tokens to mint.
    """
    erc20._mint(_to, _amount)
