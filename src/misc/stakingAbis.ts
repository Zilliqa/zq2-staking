export const depositAbi = [
  {
    "inputs": [],
    "name": "getFutureTotalStake",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdrawalPeriod",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]

export const delegatorAbi = [
  /**
   * from Delegation.sol
   */
  {
    "inputs": [],
    "name": "stake",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "shares",
        "type": "uint256"
      }
    ],
    "name": "unstake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "claim",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    // proposal to add this so app can inform user about the pending claims
    "inputs": [],
    "name": "getPendingClaims",
    "outputs": [
      {
        "internalType": "uint256[][]", // pairs of (blockNumber, amount)
        "name": "",
        "type": "uint256[][]"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  }
  /**
   * From ILiquidDelegation.sol
   */
  {
    "inputs": [],
    "name": "getLST",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPrice",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  /**
   * From BaseDelegation.sol
   */
  {
    // proposal: add to the Delegation.sol interface: getMinDelegation() returns(uint256)
    "inputs": [],
    "name": "MIN_DELEGATION",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    // proposal: add to the Delegation.sol interface: getCommission() returns(uint256, uint256) // (numerator, denumenator)
    "inputs": [],
    "name": "getCommissionNumerator",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    // proposal: add to the Delegation.sol interface: getStake() returns(uint256)
    "inputs": [],
    "name": "getStake",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    // proposal: add to the Delegation.sol interface: getClaimable() returns(uint256)
    "inputs": [],
    "name": "getClaimable",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "total",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]