def test_portfolio_fund_me_deployed(contract):
    """
    Test that the contract is deployed
    """
    assert contract is not None, "Contract should be deployed"
    assert contract.address is not None, "Contract address should not be None"
    assert contract.owner() is not None, "Contract owner should not be None"
