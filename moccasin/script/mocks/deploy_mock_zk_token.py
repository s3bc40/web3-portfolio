from src.mocks import mock_zk_token

from utils.constants import ZK_NAME, ZK_SYMBOL, ZK_DECIMALS, ZK_INITIAL_SUPPLY
from moccasin.boa_tools import VyperContract


def deploy() -> VyperContract:
    """
    Deploys the ZKsync token contract with predefined parameters.
    Returns:
        VyperContract: The deployed MockERC20 contract instance.
    """
    return mock_zk_token.deploy(ZK_NAME, ZK_SYMBOL, ZK_DECIMALS, ZK_INITIAL_SUPPLY)


def moccasin_main() -> VyperContract:
    """
    Main entry point for deploying the Mock ZK token contract.
    Returns:
        VyperContract: The deployed MockERC20 contract instance.
    """
    return deploy()
