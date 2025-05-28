import boa
from moccasin.boa_tools import VyperContract
from src import fund_me


def deploy(zk_address: str) -> VyperContract:
    """
    Deploys the FundMe contract.
    Returns:
        VyperContract: The deployed FundMe contract instance.
    """
    return fund_me.deploy(zk_address)


def moccasin_main() -> VyperContract:
    """
    Main entry point for deploying the FundMe contract.
    Returns:
        VyperContract: The deployed FundMe contract instance.
    """
    return deploy(boa.env.generate_address("zk_mock_erc20"))
