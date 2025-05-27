from moccasin.boa_tools import VyperContract
from src import portfolio_fund_me


def deploy() -> VyperContract:
    """
    Deploys the PortfolioFundMe contract.
    Returns:
        VyperContract: The deployed PortfolioFundMe contract instance.
    """
    return portfolio_fund_me.deploy()


def moccasin_main() -> VyperContract:
    """
    Main entry point for deploying the PortfolioFundMe contract.
    Returns:
        VyperContract: The deployed PortfolioFundMe contract instance.
    """
    return deploy()
