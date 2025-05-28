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
exports: erc20.__interface__


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
