import { CONTRACT_ADDRESSES } from '@/config/wagmi';

// Import ABIs - Updated to use correct artifact files
import BitrTokenABI from './abis/BitrToken.json';
import BitrFaucetABI from './abis/BitrFaucet.json';
import GuidedOracleABI from './abis/GuidedOracle.json';
import OptimisticOracleABI from './abis/OptimisticOracle.json';
import BitrPoolABI from './abis/BitrPool.json';
import BitrStakingABI from './abis/BitrStaking.json';
import ReputationSystemABI from './abis/ReputationSystem.json';
import OddysseyABI from './abis/Oddyssey.json';

// Contract configurations
export const CONTRACTS = {
  BITR_TOKEN: {
    address: CONTRACT_ADDRESSES.BITR_TOKEN,
    abi: BitrTokenABI.abi,
  },
  FAUCET: {
    address: CONTRACT_ADDRESSES.FAUCET,
    abi: BitrFaucetABI.abi,
  },
  GUIDED_ORACLE: {
    address: CONTRACT_ADDRESSES.GUIDED_ORACLE,
    abi: GuidedOracleABI.abi,
  },
  OPTIMISTIC_ORACLE: {
    address: CONTRACT_ADDRESSES.OPTIMISTIC_ORACLE,
    abi: OptimisticOracleABI.abi,
  },
  BITR_POOL: {
    address: CONTRACT_ADDRESSES.BITR_POOL,
    abi: BitrPoolABI.abi,
  },
  BITR_STAKING: {
    address: CONTRACT_ADDRESSES.STAKING,
    abi: BitrStakingABI.abi,
  },
  REPUTATION_SYSTEM: {
    address: CONTRACT_ADDRESSES.REPUTATION_SYSTEM,
    abi: ReputationSystemABI.abi,
  },
  ODDYSSEY: {
    address: CONTRACT_ADDRESSES.ODDYSSEY,
    abi: OddysseyABI.abi,
  },
} as const;

// Export ABIs for direct use
export {
  BitrTokenABI,
  BitrFaucetABI,
  GuidedOracleABI,
  OptimisticOracleABI,
  BitrPoolABI,
  BitrStakingABI,
  ReputationSystemABI,
  OddysseyABI,
};

// Contract events
export const CONTRACT_EVENTS = {
  BITR_TOKEN: {
    TRANSFER: 'Transfer',
    APPROVAL: 'Approval',
  },
  FAUCET: {
    FAUCET_CLAIMED: 'FaucetClaimed',
    COOLDOWN_SET: 'CooldownSet',
  },
  GUIDED_ORACLE: {
    OUTCOME_SUBMITTED: 'OutcomeSubmitted',
    OUTCOME_UPDATED: 'OutcomeUpdated',
  },
  OPTIMISTIC_ORACLE: {
    MARKET_CREATED: 'MarketCreated',
    OUTCOME_PROPOSED: 'OutcomeProposed',
    OUTCOME_DISPUTED: 'OutcomeDisputed',
    MARKET_RESOLVED: 'MarketResolved',
  },
  BITR_POOL: {
    POOL_CREATED: 'PoolCreated',
    BET_PLACED: 'BetPlaced',
    POOL_SETTLED: 'PoolSettled',
    WINNINGS_CLAIMED: 'WinningsClaimed',
  },
  BITR_STAKING: {
    STAKED: 'Staked',
    UNSTAKED: 'Unstaked',
    REWARDS_CLAIMED: 'RewardsClaimed',
    TIER_UPGRADED: 'TierUpgraded',
  },
  ODDYSSEY: {
    SLIP_PURCHASED: 'SlipPurchased',
    GAME_SETTLED: 'GameSettled',
    WINNINGS_CLAIMED: 'WinningsClaimed',
  },
} as const;
