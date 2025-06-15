import boa
from moccasin.moccasin_account import MoccasinAccount
from moccasin.boa_tools import VyperContract
from moccasin.config import get_config
from script import deploy_fund_me
from src.mocks import mock_zk_token
import time
from utils.constants import (
    ANVIL_DICT_ADDRESSES,
    FUNDER_INITIAL_BALANCE_WEI,
    MINIMUM_FUNDING_AMOUNT_WEI,
)

# Define public addresses from the configuration
ANVIL_OWNER_ADDRESS = ANVIL_DICT_ADDRESSES["owner"]["public"]
ANVIL_FUNDER_ETH_ADDRESS = ANVIL_DICT_ADDRESSES["funder_eth"]["public"]
ANVIL_FUNDER_ZK_ADDRESS = ANVIL_DICT_ADDRESSES["funder_zk"]["public"]
ANVIL_FUNDER_ALL_ADDRESS = ANVIL_DICT_ADDRESSES["funder_all"]["public"]
ANVIL_FUNDER_NEW_ADDRESS = ANVIL_DICT_ADDRESSES["funder_new"]["public"]


def deploy_contracts():
    """Deploys FundMe and gets the ZK token contract."""
    with boa.env.prank(ANVIL_OWNER_ADDRESS):
        fund_me_contract: VyperContract = deploy_fund_me.deploy()
    zk_token_contract: VyperContract = mock_zk_token.at(
        fund_me_contract.get_zk_token_address()
    )
    print(
        f"FundMe contract deployed at {fund_me_contract.address} with ZK token at {zk_token_contract.address}"
    )
    return fund_me_contract, zk_token_contract


def mint_zk_tokens(zk_token_contract: VyperContract):
    """Mints ZK tokens to predefined addresses."""
    for address_conf in ANVIL_DICT_ADDRESSES.values():
        # Add the address to the environment
        boa.env.add_account(
            MoccasinAccount(address_conf["private"]), FUNDER_INITIAL_BALANCE_WEI
        )
        # Mint ZK tokens to the address
        zk_token_contract.mint(address_conf["public"], FUNDER_INITIAL_BALANCE_WEI)
        print(
            f"Minted {FUNDER_INITIAL_BALANCE_WEI} ZK tokens to {address_conf['public']}"
        )


def fund_with_eth(fund_me_contract: VyperContract):
    """Funds the FundMe contract with ETH."""
    with boa.env.prank(ANVIL_FUNDER_ETH_ADDRESS):
        fund_me_contract.fund_eth(value=MINIMUM_FUNDING_AMOUNT_WEI)
        print(
            f"Funded {ANVIL_FUNDER_ETH_ADDRESS} with {MINIMUM_FUNDING_AMOUNT_WEI} wei (ETH) in the FundMe contract\n"
        )


def fund_with_zk_tokens(
    fund_me_contract: VyperContract, zk_token_contract: VyperContract
):
    """Funds the FundMe contract with ZK tokens."""
    with boa.env.prank(ANVIL_FUNDER_ZK_ADDRESS):
        zk_token_contract.approve(
            fund_me_contract.address,
            MINIMUM_FUNDING_AMOUNT_WEI,
        )
        fund_me_contract.fund_zk_token(MINIMUM_FUNDING_AMOUNT_WEI)
        print(
            f"Funded {ANVIL_FUNDER_ZK_ADDRESS} with {MINIMUM_FUNDING_AMOUNT_WEI} ZK tokens in the FundMe contract"
        )


def fund_with_eth_and_zk_tokens(
    fund_me_contract: VyperContract, zk_token_contract: VyperContract
):
    """Funds the FundMe contract with both ETH and ZK tokens."""
    with boa.env.prank(ANVIL_FUNDER_ALL_ADDRESS):
        zk_token_contract.approve(
            fund_me_contract.address,
            MINIMUM_FUNDING_AMOUNT_WEI,
        )
        fund_me_contract.fund_eth(value=MINIMUM_FUNDING_AMOUNT_WEI)
        fund_me_contract.fund_zk_token(MINIMUM_FUNDING_AMOUNT_WEI)
        print(
            f"Funded {ANVIL_FUNDER_ALL_ADDRESS} with {MINIMUM_FUNDING_AMOUNT_WEI} wei (ETH) and ZK tokens in the FundMe contract"
        )


def moccasin_main():
    """Main function to deploy contracts and fund them."""
    fund_me_contract, zk_token_contract = deploy_contracts()
    mint_zk_tokens(zk_token_contract)
    fund_with_eth(fund_me_contract)
    fund_with_zk_tokens(fund_me_contract, zk_token_contract)
    fund_with_eth_and_zk_tokens(fund_me_contract, zk_token_contract)

    return
