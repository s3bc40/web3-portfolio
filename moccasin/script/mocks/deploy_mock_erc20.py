from src.mocks import mock_erc20

from utils.constants import ZK_NAME, ZK_SYMBOL, ZK_DECIMALS, ZK_INITIAL_SUPPLY
from moccasin.boa_tools import VyperContract


def deploy() -> VyperContract:
    """
    Deploys the MockERC20 contract with predefined parameters.
    Returns:
        VyperContract: The deployed MockERC20 contract instance.
    """
    return mock_erc20.deploy(ZK_NAME, ZK_SYMBOL, ZK_DECIMALS, ZK_INITIAL_SUPPLY)


def moccasin_main() -> VyperContract:
    """
    Main entry point for deploying the MockERC20 contract.
    Returns:
        VyperContract: The deployed MockERC20 contract instance.
    """
    return deploy()
