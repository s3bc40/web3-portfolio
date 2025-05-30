################################################################
#                           MOCK ZK                            #
################################################################
# def __init__(_name: String[64], _symbol: String[32], _decimals: uint8, _initial_supply: uint256):
ZK_NAME = "Moccasin ZK"
ZK_SYMBOL = "MOCZK"
ZK_DECIMALS = 18
ZK_INITIAL_SUPPLY = 10_000 * 10**18  # 10,000 tokens with 18 decimals


################################################################
#                            TESTS                             #
################################################################
MINIMUM_FUNDING_AMOUNT_WEI = 1 * 10**14  # 0.0001 ETH in wei
FUNDER_INITIAL_BALANCE_WEI = 1000 * 10**18  # 1000 ETH in wei
ONE_ETH_IN_WEI = 1 * 10**18  # 1 ETH in wei
FUNDER_COUNT = 5  # Number of funders to simulate in tests
