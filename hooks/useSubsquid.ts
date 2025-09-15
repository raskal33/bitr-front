import { useQuery, useSubscription } from '@apollo/client'
import {
  GET_POOLS,
  GET_USER_POOLS,
  GET_USER_STATS,
  GET_ODDYSSEY_CYCLES,
  GET_STAKING_EVENTS,
  GET_PLATFORM_STATS,
  GET_REPUTATION_UPDATES,
  GET_FAUCET_CLAIMS,
  GET_TOKEN_TRANSFERS,
  POOL_CREATED_SUBSCRIPTION,
  BET_PLACED_SUBSCRIPTION,
} from '../lib/subsquid'

// Custom hooks for Subsquid data
export const usePools = (first = 20, skip = 0) => {
  return useQuery(GET_POOLS, {
    variables: { first, skip },
    pollInterval: 5000, // Poll every 5 seconds for real-time updates
  })
}

export const useUserPools = (creator: string) => {
  return useQuery(GET_USER_POOLS, {
    variables: { creator },
    skip: !creator,
    pollInterval: 5000,
  })
}

export const useUserStats = (user: string) => {
  return useQuery(GET_USER_STATS, {
    variables: { user },
    skip: !user,
    pollInterval: 10000,
  })
}

export const useOddysseyCycles = (first = 10, skip = 0) => {
  return useQuery(GET_ODDYSSEY_CYCLES, {
    variables: { first, skip },
    pollInterval: 5000,
  })
}

export const useStakingEvents = (user: string, first = 20, skip = 0) => {
  return useQuery(GET_STAKING_EVENTS, {
    variables: { user, first, skip },
    skip: !user,
    pollInterval: 10000,
  })
}

export const usePlatformStats = () => {
  return useQuery(GET_PLATFORM_STATS, {
    pollInterval: 30000, // Poll every 30 seconds
  })
}

export const useReputationUpdates = (user: string, first = 20, skip = 0) => {
  return useQuery(GET_REPUTATION_UPDATES, {
    variables: { user, first, skip },
    skip: !user,
    pollInterval: 10000,
  })
}

export const useFaucetClaims = (user: string, first = 20, skip = 0) => {
  return useQuery(GET_FAUCET_CLAIMS, {
    variables: { user, first, skip },
    skip: !user,
    pollInterval: 10000,
  })
}

export const useTokenTransfers = (user: string, first = 20, skip = 0) => {
  return useQuery(GET_TOKEN_TRANSFERS, {
    variables: { user, first, skip },
    skip: !user,
    pollInterval: 10000,
  })
}

// Real-time subscriptions
export const usePoolCreatedSubscription = () => {
  return useSubscription(POOL_CREATED_SUBSCRIPTION)
}

export const useBetPlacedSubscription = () => {
  return useSubscription(BET_PLACED_SUBSCRIPTION)
}

// Combined analytics hook
export const useUserAnalytics = (user: string) => {
  const stats = useUserStats(user)
  const pools = useUserPools(user)
  const staking = useStakingEvents(user)
  const reputation = useReputationUpdates(user)
  const faucet = useFaucetClaims(user)
  const transfers = useTokenTransfers(user)

  return {
    stats,
    pools,
    staking,
    reputation,
    faucet,
    transfers,
    loading: stats.loading || pools.loading || staking.loading || reputation.loading || faucet.loading || transfers.loading,
    error: stats.error || pools.error || staking.error || reputation.error || faucet.error || transfers.error,
  }
}
