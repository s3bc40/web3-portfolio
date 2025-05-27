from moccasin.boa_tools import VyperContract
from src import fund_me


def deploy() -> VyperContract:
    """
    Deploys the FundMe contract.
    Returns:
        VyperContract: The deployed FundMe contract instance.
    """
    return fund_me.deploy()


def moccasin_main() -> VyperContract:
    """
    Main entry point for deploying the FundMe contract.
    Returns:
        VyperContract: The deployed FundMe contract instance.
    """
    return deploy()
