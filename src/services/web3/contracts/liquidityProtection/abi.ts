import { AbiItem } from 'web3-utils';

export const ABILiquidityProtection: AbiItem[] = [
  {
    inputs: [
      {
        internalType: 'address[8]',
        name: '_contractAddresses',
        type: 'address[8]',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: '_prevOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: '_newOwner',
        type: 'address',
      },
    ],
    name: 'OwnerUpdate',
    type: 'event',
  },
  {
    inputs: [],
    name: 'acceptOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'acceptStoreOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'acceptWalletOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IConverterAnchor',
        name: '_poolAnchor',
        type: 'address',
      },
      {
        internalType: 'contract IERC20Token',
        name: '_reserveToken',
        type: 'address',
      },
      { internalType: 'uint256', name: '_amount', type: 'uint256' },
    ],
    name: 'addLiquidity',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_owner', type: 'address' },
      {
        internalType: 'contract IConverterAnchor',
        name: '_poolAnchor',
        type: 'address',
      },
      {
        internalType: 'contract IERC20Token',
        name: '_reserveToken',
        type: 'address',
      },
      { internalType: 'uint256', name: '_amount', type: 'uint256' },
    ],
    name: 'addLiquidityFor',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IConverterAnchor',
        name: '_poolAnchor',
        type: 'address',
      },
    ],
    name: 'baseTokenAvailableSpace',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_startIndex', type: 'uint256' },
      { internalType: 'uint256', name: '_endIndex', type: 'uint256' },
    ],
    name: 'claimBalance',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'govToken',
    outputs: [
      { internalType: 'contract IERC20Token', name: '', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'govTokenGovernance',
    outputs: [
      { internalType: 'contract ITokenGovernance', name: '', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'lastRemoveCheckpointStore',
    outputs: [
      { internalType: 'contract ICheckpointStore', name: '', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'networkToken',
    outputs: [
      { internalType: 'contract IERC20Token', name: '', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IConverterAnchor',
        name: '_poolAnchor',
        type: 'address',
      },
    ],
    name: 'networkTokenAvailableSpace',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'networkTokenGovernance',
    outputs: [
      { internalType: 'contract ITokenGovernance', name: '', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'newOwner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IConverterAnchor',
        name: '_poolAnchor',
        type: 'address',
      },
    ],
    name: 'poolAvailableSpace',
    outputs: [
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'uint256', name: '', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IDSToken',
        name: '_poolToken',
        type: 'address',
      },
      {
        internalType: 'contract IERC20Token',
        name: '_reserveToken',
        type: 'address',
      },
      { internalType: 'uint256', name: '_reserveAmount', type: 'uint256' },
      { internalType: 'uint256', name: '_poolRateN', type: 'uint256' },
      { internalType: 'uint256', name: '_poolRateD', type: 'uint256' },
      { internalType: 'uint256', name: '_reserveRateN', type: 'uint256' },
      { internalType: 'uint256', name: '_reserveRateD', type: 'uint256' },
    ],
    name: 'poolROI',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_id', type: 'uint256' },
      { internalType: 'uint32', name: '_portion', type: 'uint32' },
    ],
    name: 'removeLiquidity',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_id', type: 'uint256' },
      { internalType: 'uint32', name: '_portion', type: 'uint32' },
      { internalType: 'uint256', name: '_removeTimestamp', type: 'uint256' },
    ],
    name: 'removeLiquidityReturn',
    outputs: [
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'uint256', name: '', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'settings',
    outputs: [
      {
        internalType: 'contract ILiquidityProtectionSettings',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'stats',
    outputs: [
      {
        internalType: 'contract ILiquidityProtectionStats',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'store',
    outputs: [
      {
        internalType: 'contract ILiquidityProtectionStore',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'systemStore',
    outputs: [
      {
        internalType: 'contract ILiquidityProtectionSystemStore',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_newOwner', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_newOwner', type: 'address' }],
    name: 'transferStoreOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_newOwner', type: 'address' }],
    name: 'transferWalletOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'wallet',
    outputs: [
      { internalType: 'contract ITokenHolder', name: '', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];

export const ABILiquidityProtectionSystemStore: AbiItem[] = [
  { inputs: [], stateMutability: 'nonpayable', type: 'constructor' },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'contract IConverterAnchor',
        name: 'poolAnchor',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'prevAmount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newAmount',
        type: 'uint256',
      },
    ],
    name: 'NetworkTokensMintedUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'role', type: 'bytes32' },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'previousAdminRole',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'newAdminRole',
        type: 'bytes32',
      },
    ],
    name: 'RoleAdminChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'role', type: 'bytes32' },
      {
        indexed: true,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
    ],
    name: 'RoleGranted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'role', type: 'bytes32' },
      {
        indexed: true,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
    ],
    name: 'RoleRevoked',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'contract IERC20Token',
        name: 'token',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'prevAmount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newAmount',
        type: 'uint256',
      },
    ],
    name: 'SystemBalanceUpdated',
    type: 'event',
  },
  {
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'ROLE_OWNER',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'ROLE_SUPERVISOR',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IConverterAnchor',
        name: 'poolAnchor',
        type: 'address',
      },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'decNetworkTokensMinted',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'contract IERC20Token', name: 'token', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'decSystemBalance',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'role', type: 'bytes32' }],
    name: 'getRoleAdmin',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { internalType: 'uint256', name: 'index', type: 'uint256' },
    ],
    name: 'getRoleMember',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'role', type: 'bytes32' }],
    name: 'getRoleMemberCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { internalType: 'address', name: 'account', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { internalType: 'address', name: 'account', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IConverterAnchor',
        name: 'poolAnchor',
        type: 'address',
      },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'incNetworkTokensMinted',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'contract IERC20Token', name: 'token', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'incSystemBalance',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IConverterAnchor',
        name: 'poolAnchor',
        type: 'address',
      },
    ],
    name: 'networkTokensMinted',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { internalType: 'address', name: 'account', type: 'address' },
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { internalType: 'address', name: 'account', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'contract IERC20Token', name: 'token', type: 'address' },
    ],
    name: 'systemBalance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
];
