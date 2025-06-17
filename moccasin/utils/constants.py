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
FUZZING_FUNDER_COUNT = 10  # Number of funders for fuzzing tests
FUZZING_MAX_FUNDING_AMOUNT_WEI = 20 * 10**18  # 20 ETH in wei
FUZZING_MAX_WITHDRAWAL_AMOUNT_WEI = 10 * 10**18  # 10 ETH in wei

################################################################
#                         ANVIL STATE                          #
################################################################
ANVIL_DICT_ADDRESSES = {
    "owner": {
        "public": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "private": "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    },
    "funder_eth": {
        "public": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "private": "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
    },
    "funder_zk": {
        "public": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        "private": "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
    },
    "funder_all": {
        "public": "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
        "private": "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6",
    },
    "funder_new": {
        "public": "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
        "private": "0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a",
    },
}
