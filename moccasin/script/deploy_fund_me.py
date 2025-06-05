from moccasin.boa_tools import VyperContract
from moccasin.config import get_config
from src import fund_me


def deploy() -> VyperContract:
    """
    Deploys the FundMe contract.
    Returns:
        VyperContract: The deployed FundMe contract instance.
    """
    active_network = get_config().get_active_network()
    zksync_token: VyperContract = active_network.manifest_named("zktoken")
    fund_me_contract: VyperContract = fund_me.deploy(zksync_token.address)
    if (
        active_network.has_explorer()
        and not active_network.is_local_or_forked_network()
    ):
        result = active_network.moccasin_verify(fund_me_contract)
        result.wait_for_verification()
    return fund_me_contract


def moccasin_main() -> VyperContract:
    """
    Main entry point for deploying the FundMe contract.
    Returns:
        VyperContract: The deployed FundMe contract instance.
    """
    return deploy()
