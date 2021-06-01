import { CallReturn } from 'eth-multicall';
import { ContractMethods } from 'web3/types';
import { ContractSendMethod } from 'web3-eth-contract';
import Web3 from 'web3';
import { buildContract } from 'web3/contracts';
import { EthAddress } from 'web3/types';
import { ABIBancorGovernance } from './abi';

export interface Votes {
  voted: undefined | 'for' | 'against';
  for: string;
  against: string;
}

export interface Voter {
  votes: Votes;
  account: string;
}

export interface ProposalMetaData {
  payload: {
    body: string;
    metadata: {
      github: string;
      discourse: string;
    };
    name: string;
  };
  timestamp: number;
  revision: string;
}

export interface Proposal {
  id: number;
  // timestamp
  start: number;
  // timestamp
  end: number;
  name: string;
  executor: EthAddress;
  hash: string;
  open: boolean;
  proposer: EthAddress;
  quorum: string;
  quorumRequired: string;
  totalVotesAgainst: number;
  totalVotesFor: number;
  totalVotes: number;
  totalAvailableVotes: number;
  // votes of currently logged in user
  votes: Votes;
  metadata?: ProposalMetaData;
  voters: Voter[];
}

export const buildGovernanceContract = (
  contractAddress?: string,
  web3?: Web3
): ContractMethods<{
  voteDuration: () => CallReturn<string>;
  voteLockDuration: () => CallReturn<string>;
  voteLockFraction: () => CallReturn<string>;
  newProposalMinimum: () => CallReturn<string>;
  propose: (executor: string, hash: string) => ContractSendMethod;
  voteFor: (proposalId: string) => ContractSendMethod;
  voteAgainst: (proposalId: string) => ContractSendMethod;
  stake: (amount: string) => ContractSendMethod;
  unstake: (amount: string) => ContractSendMethod;
  decimals: () => CallReturn<string>;
  proposalCount: () => CallReturn<number>;
  proposals: (proposalI: number) => CallReturn<Proposal>;
  votesOf: (voter: string) => CallReturn<string>;
  votesForOf: (voter: string, proposalId: number) => CallReturn<string>;
  votesAgainstOf: (voter: string, proposalId: number) => CallReturn<string>;
  voteLocks: (voter: string) => CallReturn<string>;
  govToken: () => CallReturn<string>;
}> => buildContract(ABIBancorGovernance, contractAddress, web3);
