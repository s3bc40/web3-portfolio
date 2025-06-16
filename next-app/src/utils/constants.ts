/**
 * Social media links for the developer
 * @description This object contains the social media links for the developer.
 */
export const SOCIAL_MEDIA_LINKS = {
    github: "https://github.com/s3bc40",
    xTwitter: "https://x.com/s3bc40",
    telegram: "https://t.me/s3bc40",
}

/**
 * ABI for the FundMe contract
 * @description This is the ABI for the FundMe contract, which is used to interact with the contract on the blockchain.
 */
export const FUND_ME_ABI = [
    {
        "name": "FundedETH",
        "inputs": [
            {
                "name": "funder",
                "type": "address",
                "indexed": true
            },
            {
                "name": "amount",
                "type": "uint256",
                "indexed": false
            }
        ],
        "anonymous": false,
        "type": "event"
    },
    {
        "name": "FundedZKToken",
        "inputs": [
            {
                "name": "funder",
                "type": "address",
                "indexed": true
            },
            {
                "name": "amount",
                "type": "uint256",
                "indexed": false
            }
        ],
        "anonymous": false,
        "type": "event"
    },
    {
        "name": "WithdrawEth",
        "inputs": [
            {
                "name": "to",
                "type": "address",
                "indexed": true
            },
            {
                "name": "amount",
                "type": "uint256",
                "indexed": false
            }
        ],
        "anonymous": false,
        "type": "event"
    },
    {
        "name": "WithdrawZK",
        "inputs": [
            {
                "name": "to",
                "type": "address",
                "indexed": true
            },
            {
                "name": "amount",
                "type": "uint256",
                "indexed": false
            }
        ],
        "anonymous": false,
        "type": "event"
    },
    {
        "name": "OwnershipTransferred",
        "inputs": [
            {
                "name": "previous_owner",
                "type": "address",
                "indexed": true
            },
            {
                "name": "new_owner",
                "type": "address",
                "indexed": true
            }
        ],
        "anonymous": false,
        "type": "event"
    },
    {
        "stateMutability": "view",
        "type": "function",
        "name": "owner",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "address"
            }
        ]
    },
    {
        "stateMutability": "payable",
        "type": "fallback"
    },
    {
        "stateMutability": "payable",
        "type": "function",
        "name": "fund_eth",
        "inputs": [],
        "outputs": []
    },
    {
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "fund_zk_token",
        "inputs": [
            {
                "name": "_amount",
                "type": "uint256"
            }
        ],
        "outputs": []
    },
    {
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "withdraw_eth",
        "inputs": [
            {
                "name": "_amount",
                "type": "uint256"
            }
        ],
        "outputs": []
    },
    {
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "withdraw_zk_token",
        "inputs": [
            {
                "name": "_amount",
                "type": "uint256"
            }
        ],
        "outputs": []
    },
    {
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "set_zk_token_address",
        "inputs": [
            {
                "name": "_zk_token_address",
                "type": "address"
            }
        ],
        "outputs": []
    },
    {
        "stateMutability": "view",
        "type": "function",
        "name": "get_funder_eth_amount",
        "inputs": [
            {
                "name": "funder",
                "type": "address"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "stateMutability": "view",
        "type": "function",
        "name": "get_funder_zk_token_amount",
        "inputs": [
            {
                "name": "funder",
                "type": "address"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "stateMutability": "view",
        "type": "function",
        "name": "get_minimal_funding_amount",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "stateMutability": "view",
        "type": "function",
        "name": "get_zk_token_address",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "address"
            }
        ]
    },
    {
        "stateMutability": "view",
        "type": "function",
        "name": "ZERO_ADDRESS_ERROR",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ]
    },
    {
        "stateMutability": "view",
        "type": "function",
        "name": "INSUFFICIENT_AMOUNT_ERROR",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ]
    },
    {
        "stateMutability": "view",
        "type": "function",
        "name": "FUNDING_TRANSFER_FAILED_ERROR",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ]
    },
    {
        "stateMutability": "view",
        "type": "function",
        "name": "DIRECT_TRANSFER_ERROR",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ]
    },
    {
        "stateMutability": "view",
        "type": "function",
        "name": "WITHDRAWAL_AMOUNT_EXCEEDS_BALANCE_ERROR",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ]
    },
    {
        "stateMutability": "view",
        "type": "function",
        "name": "balance_of_eth",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "stateMutability": "view",
        "type": "function",
        "name": "balance_of_zk_token",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "stateMutability": "view",
        "type": "function",
        "name": "funder_count",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "stateMutability": "nonpayable",
        "type": "constructor",
        "inputs": [
            {
                "name": "_zk_token_address",
                "type": "address"
            }
        ],
        "outputs": []
    }
]
