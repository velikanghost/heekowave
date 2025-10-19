import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DelegationManager
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const delegationManagerAbi = [
  {
    type: 'function',
    inputs: [
      { name: 'delegator', internalType: 'address', type: 'address' },
      { name: 'delegate', internalType: 'address', type: 'address' },
      { name: 'caveatHash', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'executeDelegation',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'delegator', internalType: 'address', type: 'address' },
      { name: 'delegate', internalType: 'address', type: 'address' },
    ],
    name: 'isValidDelegation',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
] as const

export const delegationManagerAddress =
  '0xdb9B1e94B5b69Df7e401DDbedE43491141047dB3' as const

export const delegationManagerConfig = {
  address: delegationManagerAddress,
  abi: delegationManagerAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// HeekowavePayments
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const heekowavePaymentsAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_delegationManager', internalType: 'address', type: 'address' },
      { name: '_usdcToken', internalType: 'address', type: 'address' },
      { name: '_initialOwner', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'delegationManager',
    outputs: [
      {
        name: '',
        internalType: 'contract IDelegationManager',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'emergencyWithdraw',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'requestId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'fulfillRequest',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getDelegationManager',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'requestId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getPaymentRequest',
    outputs: [
      {
        name: 'request',
        internalType: 'struct HeekowavePayments.PaymentRequest',
        type: 'tuple',
        components: [
          { name: 'from', internalType: 'address', type: 'address' },
          { name: 'to', internalType: 'address', type: 'address' },
          { name: 'amount', internalType: 'uint256', type: 'uint256' },
          { name: 'token', internalType: 'address', type: 'address' },
          { name: 'fulfilled', internalType: 'bool', type: 'bool' },
          { name: 'createdAt', internalType: 'uint256', type: 'uint256' },
          { name: 'fulfilledAt', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    name: 'paymentRequests',
    outputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'fulfilled', internalType: 'bool', type: 'bool' },
      { name: 'createdAt', internalType: 'uint256', type: 'uint256' },
      { name: 'fulfilledAt', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'requestCounter',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'token', internalType: 'address', type: 'address' },
    ],
    name: 'requestPayment',
    outputs: [{ name: 'requestId', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'token', internalType: 'address', type: 'address' },
    ],
    name: 'sendPayment',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'usdcToken',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'token',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'requestId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'timestamp',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'PaymentRequested',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'token',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'timestamp',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'txHash',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
    ],
    name: 'PaymentSent',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'requestId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'fulfiller',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'timestamp',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'RequestFulfilled',
  },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// HeekowaveWithdrawal
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const heekowaveWithdrawalAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_usdcToken', internalType: 'address', type: 'address' },
      { name: '_initialOwner', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'emergencyWithdraw',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getContractBalance',
    outputs: [{ name: 'balance', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'requestId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getWithdrawalRequest',
    outputs: [
      {
        name: 'request',
        internalType: 'struct HeekowaveWithdrawal.WithdrawalRequest',
        type: 'tuple',
        components: [
          { name: 'user', internalType: 'address', type: 'address' },
          { name: 'amount', internalType: 'uint256', type: 'uint256' },
          { name: 'currency', internalType: 'string', type: 'string' },
          { name: 'bankDetails', internalType: 'string', type: 'string' },
          { name: 'processed', internalType: 'bool', type: 'bool' },
          { name: 'success', internalType: 'bool', type: 'bool' },
          { name: 'message', internalType: 'string', type: 'string' },
          { name: 'createdAt', internalType: 'uint256', type: 'uint256' },
          { name: 'processedAt', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'requestId', internalType: 'bytes32', type: 'bytes32' },
      { name: 'success', internalType: 'bool', type: 'bool' },
      { name: 'message', internalType: 'string', type: 'string' },
    ],
    name: 'processWithdrawal',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'processor',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'requestCounter',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'currency', internalType: 'string', type: 'string' },
      { name: 'bankDetails', internalType: 'string', type: 'string' },
    ],
    name: 'requestWithdrawal',
    outputs: [{ name: 'requestId', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_processor', internalType: 'address', type: 'address' }],
    name: 'setProcessor',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'usdcToken',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    name: 'withdrawalRequests',
    outputs: [
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'currency', internalType: 'string', type: 'string' },
      { name: 'bankDetails', internalType: 'string', type: 'string' },
      { name: 'processed', internalType: 'bool', type: 'bool' },
      { name: 'success', internalType: 'bool', type: 'bool' },
      { name: 'message', internalType: 'string', type: 'string' },
      { name: 'createdAt', internalType: 'uint256', type: 'uint256' },
      { name: 'processedAt', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'requestId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      { name: 'success', internalType: 'bool', type: 'bool', indexed: false },
      {
        name: 'message',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
      {
        name: 'timestamp',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'WithdrawalCompleted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'currency',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
      {
        name: 'bankDetails',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
      {
        name: 'requestId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'timestamp',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'WithdrawalRequested',
  },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link delegationManagerAbi}__
 */
export const useReadDelegationManager = /*#__PURE__*/ createUseReadContract({
  abi: delegationManagerAbi,
  address: delegationManagerAddress,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link delegationManagerAbi}__ and `functionName` set to `"isValidDelegation"`
 */
export const useReadDelegationManagerIsValidDelegation =
  /*#__PURE__*/ createUseReadContract({
    abi: delegationManagerAbi,
    address: delegationManagerAddress,
    functionName: 'isValidDelegation',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link delegationManagerAbi}__
 */
export const useWriteDelegationManager = /*#__PURE__*/ createUseWriteContract({
  abi: delegationManagerAbi,
  address: delegationManagerAddress,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link delegationManagerAbi}__ and `functionName` set to `"executeDelegation"`
 */
export const useWriteDelegationManagerExecuteDelegation =
  /*#__PURE__*/ createUseWriteContract({
    abi: delegationManagerAbi,
    address: delegationManagerAddress,
    functionName: 'executeDelegation',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link delegationManagerAbi}__
 */
export const useSimulateDelegationManager =
  /*#__PURE__*/ createUseSimulateContract({
    abi: delegationManagerAbi,
    address: delegationManagerAddress,
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link delegationManagerAbi}__ and `functionName` set to `"executeDelegation"`
 */
export const useSimulateDelegationManagerExecuteDelegation =
  /*#__PURE__*/ createUseSimulateContract({
    abi: delegationManagerAbi,
    address: delegationManagerAddress,
    functionName: 'executeDelegation',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link heekowavePaymentsAbi}__
 */
export const useReadHeekowavePayments = /*#__PURE__*/ createUseReadContract({
  abi: heekowavePaymentsAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link heekowavePaymentsAbi}__ and `functionName` set to `"delegationManager"`
 */
export const useReadHeekowavePaymentsDelegationManager =
  /*#__PURE__*/ createUseReadContract({
    abi: heekowavePaymentsAbi,
    functionName: 'delegationManager',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link heekowavePaymentsAbi}__ and `functionName` set to `"getDelegationManager"`
 */
export const useReadHeekowavePaymentsGetDelegationManager =
  /*#__PURE__*/ createUseReadContract({
    abi: heekowavePaymentsAbi,
    functionName: 'getDelegationManager',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link heekowavePaymentsAbi}__ and `functionName` set to `"getPaymentRequest"`
 */
export const useReadHeekowavePaymentsGetPaymentRequest =
  /*#__PURE__*/ createUseReadContract({
    abi: heekowavePaymentsAbi,
    functionName: 'getPaymentRequest',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link heekowavePaymentsAbi}__ and `functionName` set to `"owner"`
 */
export const useReadHeekowavePaymentsOwner =
  /*#__PURE__*/ createUseReadContract({
    abi: heekowavePaymentsAbi,
    functionName: 'owner',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link heekowavePaymentsAbi}__ and `functionName` set to `"paymentRequests"`
 */
export const useReadHeekowavePaymentsPaymentRequests =
  /*#__PURE__*/ createUseReadContract({
    abi: heekowavePaymentsAbi,
    functionName: 'paymentRequests',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link heekowavePaymentsAbi}__ and `functionName` set to `"requestCounter"`
 */
export const useReadHeekowavePaymentsRequestCounter =
  /*#__PURE__*/ createUseReadContract({
    abi: heekowavePaymentsAbi,
    functionName: 'requestCounter',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link heekowavePaymentsAbi}__ and `functionName` set to `"usdcToken"`
 */
export const useReadHeekowavePaymentsUsdcToken =
  /*#__PURE__*/ createUseReadContract({
    abi: heekowavePaymentsAbi,
    functionName: 'usdcToken',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link heekowavePaymentsAbi}__
 */
export const useWriteHeekowavePayments = /*#__PURE__*/ createUseWriteContract({
  abi: heekowavePaymentsAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link heekowavePaymentsAbi}__ and `functionName` set to `"emergencyWithdraw"`
 */
export const useWriteHeekowavePaymentsEmergencyWithdraw =
  /*#__PURE__*/ createUseWriteContract({
    abi: heekowavePaymentsAbi,
    functionName: 'emergencyWithdraw',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link heekowavePaymentsAbi}__ and `functionName` set to `"fulfillRequest"`
 */
export const useWriteHeekowavePaymentsFulfillRequest =
  /*#__PURE__*/ createUseWriteContract({
    abi: heekowavePaymentsAbi,
    functionName: 'fulfillRequest',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link heekowavePaymentsAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteHeekowavePaymentsRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: heekowavePaymentsAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link heekowavePaymentsAbi}__ and `functionName` set to `"requestPayment"`
 */
export const useWriteHeekowavePaymentsRequestPayment =
  /*#__PURE__*/ createUseWriteContract({
    abi: heekowavePaymentsAbi,
    functionName: 'requestPayment',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link heekowavePaymentsAbi}__ and `functionName` set to `"sendPayment"`
 */
export const useWriteHeekowavePaymentsSendPayment =
  /*#__PURE__*/ createUseWriteContract({
    abi: heekowavePaymentsAbi,
    functionName: 'sendPayment',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link heekowavePaymentsAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteHeekowavePaymentsTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: heekowavePaymentsAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link heekowavePaymentsAbi}__
 */
export const useSimulateHeekowavePayments =
  /*#__PURE__*/ createUseSimulateContract({ abi: heekowavePaymentsAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link heekowavePaymentsAbi}__ and `functionName` set to `"emergencyWithdraw"`
 */
export const useSimulateHeekowavePaymentsEmergencyWithdraw =
  /*#__PURE__*/ createUseSimulateContract({
    abi: heekowavePaymentsAbi,
    functionName: 'emergencyWithdraw',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link heekowavePaymentsAbi}__ and `functionName` set to `"fulfillRequest"`
 */
export const useSimulateHeekowavePaymentsFulfillRequest =
  /*#__PURE__*/ createUseSimulateContract({
    abi: heekowavePaymentsAbi,
    functionName: 'fulfillRequest',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link heekowavePaymentsAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateHeekowavePaymentsRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: heekowavePaymentsAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link heekowavePaymentsAbi}__ and `functionName` set to `"requestPayment"`
 */
export const useSimulateHeekowavePaymentsRequestPayment =
  /*#__PURE__*/ createUseSimulateContract({
    abi: heekowavePaymentsAbi,
    functionName: 'requestPayment',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link heekowavePaymentsAbi}__ and `functionName` set to `"sendPayment"`
 */
export const useSimulateHeekowavePaymentsSendPayment =
  /*#__PURE__*/ createUseSimulateContract({
    abi: heekowavePaymentsAbi,
    functionName: 'sendPayment',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link heekowavePaymentsAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateHeekowavePaymentsTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: heekowavePaymentsAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link heekowavePaymentsAbi}__
 */
export const useWatchHeekowavePaymentsEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: heekowavePaymentsAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link heekowavePaymentsAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchHeekowavePaymentsOwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: heekowavePaymentsAbi,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link heekowavePaymentsAbi}__ and `eventName` set to `"PaymentRequested"`
 */
export const useWatchHeekowavePaymentsPaymentRequestedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: heekowavePaymentsAbi,
    eventName: 'PaymentRequested',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link heekowavePaymentsAbi}__ and `eventName` set to `"PaymentSent"`
 */
export const useWatchHeekowavePaymentsPaymentSentEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: heekowavePaymentsAbi,
    eventName: 'PaymentSent',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link heekowavePaymentsAbi}__ and `eventName` set to `"RequestFulfilled"`
 */
export const useWatchHeekowavePaymentsRequestFulfilledEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: heekowavePaymentsAbi,
    eventName: 'RequestFulfilled',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link heekowaveWithdrawalAbi}__
 */
export const useReadHeekowaveWithdrawal = /*#__PURE__*/ createUseReadContract({
  abi: heekowaveWithdrawalAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link heekowaveWithdrawalAbi}__ and `functionName` set to `"getContractBalance"`
 */
export const useReadHeekowaveWithdrawalGetContractBalance =
  /*#__PURE__*/ createUseReadContract({
    abi: heekowaveWithdrawalAbi,
    functionName: 'getContractBalance',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link heekowaveWithdrawalAbi}__ and `functionName` set to `"getWithdrawalRequest"`
 */
export const useReadHeekowaveWithdrawalGetWithdrawalRequest =
  /*#__PURE__*/ createUseReadContract({
    abi: heekowaveWithdrawalAbi,
    functionName: 'getWithdrawalRequest',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link heekowaveWithdrawalAbi}__ and `functionName` set to `"owner"`
 */
export const useReadHeekowaveWithdrawalOwner =
  /*#__PURE__*/ createUseReadContract({
    abi: heekowaveWithdrawalAbi,
    functionName: 'owner',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link heekowaveWithdrawalAbi}__ and `functionName` set to `"processor"`
 */
export const useReadHeekowaveWithdrawalProcessor =
  /*#__PURE__*/ createUseReadContract({
    abi: heekowaveWithdrawalAbi,
    functionName: 'processor',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link heekowaveWithdrawalAbi}__ and `functionName` set to `"requestCounter"`
 */
export const useReadHeekowaveWithdrawalRequestCounter =
  /*#__PURE__*/ createUseReadContract({
    abi: heekowaveWithdrawalAbi,
    functionName: 'requestCounter',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link heekowaveWithdrawalAbi}__ and `functionName` set to `"usdcToken"`
 */
export const useReadHeekowaveWithdrawalUsdcToken =
  /*#__PURE__*/ createUseReadContract({
    abi: heekowaveWithdrawalAbi,
    functionName: 'usdcToken',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link heekowaveWithdrawalAbi}__ and `functionName` set to `"withdrawalRequests"`
 */
export const useReadHeekowaveWithdrawalWithdrawalRequests =
  /*#__PURE__*/ createUseReadContract({
    abi: heekowaveWithdrawalAbi,
    functionName: 'withdrawalRequests',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link heekowaveWithdrawalAbi}__
 */
export const useWriteHeekowaveWithdrawal = /*#__PURE__*/ createUseWriteContract(
  { abi: heekowaveWithdrawalAbi },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link heekowaveWithdrawalAbi}__ and `functionName` set to `"emergencyWithdraw"`
 */
export const useWriteHeekowaveWithdrawalEmergencyWithdraw =
  /*#__PURE__*/ createUseWriteContract({
    abi: heekowaveWithdrawalAbi,
    functionName: 'emergencyWithdraw',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link heekowaveWithdrawalAbi}__ and `functionName` set to `"processWithdrawal"`
 */
export const useWriteHeekowaveWithdrawalProcessWithdrawal =
  /*#__PURE__*/ createUseWriteContract({
    abi: heekowaveWithdrawalAbi,
    functionName: 'processWithdrawal',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link heekowaveWithdrawalAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteHeekowaveWithdrawalRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: heekowaveWithdrawalAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link heekowaveWithdrawalAbi}__ and `functionName` set to `"requestWithdrawal"`
 */
export const useWriteHeekowaveWithdrawalRequestWithdrawal =
  /*#__PURE__*/ createUseWriteContract({
    abi: heekowaveWithdrawalAbi,
    functionName: 'requestWithdrawal',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link heekowaveWithdrawalAbi}__ and `functionName` set to `"setProcessor"`
 */
export const useWriteHeekowaveWithdrawalSetProcessor =
  /*#__PURE__*/ createUseWriteContract({
    abi: heekowaveWithdrawalAbi,
    functionName: 'setProcessor',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link heekowaveWithdrawalAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteHeekowaveWithdrawalTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: heekowaveWithdrawalAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link heekowaveWithdrawalAbi}__
 */
export const useSimulateHeekowaveWithdrawal =
  /*#__PURE__*/ createUseSimulateContract({ abi: heekowaveWithdrawalAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link heekowaveWithdrawalAbi}__ and `functionName` set to `"emergencyWithdraw"`
 */
export const useSimulateHeekowaveWithdrawalEmergencyWithdraw =
  /*#__PURE__*/ createUseSimulateContract({
    abi: heekowaveWithdrawalAbi,
    functionName: 'emergencyWithdraw',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link heekowaveWithdrawalAbi}__ and `functionName` set to `"processWithdrawal"`
 */
export const useSimulateHeekowaveWithdrawalProcessWithdrawal =
  /*#__PURE__*/ createUseSimulateContract({
    abi: heekowaveWithdrawalAbi,
    functionName: 'processWithdrawal',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link heekowaveWithdrawalAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateHeekowaveWithdrawalRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: heekowaveWithdrawalAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link heekowaveWithdrawalAbi}__ and `functionName` set to `"requestWithdrawal"`
 */
export const useSimulateHeekowaveWithdrawalRequestWithdrawal =
  /*#__PURE__*/ createUseSimulateContract({
    abi: heekowaveWithdrawalAbi,
    functionName: 'requestWithdrawal',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link heekowaveWithdrawalAbi}__ and `functionName` set to `"setProcessor"`
 */
export const useSimulateHeekowaveWithdrawalSetProcessor =
  /*#__PURE__*/ createUseSimulateContract({
    abi: heekowaveWithdrawalAbi,
    functionName: 'setProcessor',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link heekowaveWithdrawalAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateHeekowaveWithdrawalTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: heekowaveWithdrawalAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link heekowaveWithdrawalAbi}__
 */
export const useWatchHeekowaveWithdrawalEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: heekowaveWithdrawalAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link heekowaveWithdrawalAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchHeekowaveWithdrawalOwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: heekowaveWithdrawalAbi,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link heekowaveWithdrawalAbi}__ and `eventName` set to `"WithdrawalCompleted"`
 */
export const useWatchHeekowaveWithdrawalWithdrawalCompletedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: heekowaveWithdrawalAbi,
    eventName: 'WithdrawalCompleted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link heekowaveWithdrawalAbi}__ and `eventName` set to `"WithdrawalRequested"`
 */
export const useWatchHeekowaveWithdrawalWithdrawalRequestedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: heekowaveWithdrawalAbi,
    eventName: 'WithdrawalRequested',
  })
