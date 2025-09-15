import { ApolloClient, InMemoryCache, gql } from '@apollo/client'

// Subsquid GraphQL endpoint
const SUBSQUID_ENDPOINT = process.env.NEXT_PUBLIC_SUBSQUID_URL || 'http://localhost:4000/graphql'

export const subsquidClient = new ApolloClient({
  uri: SUBSQUID_ENDPOINT,
  cache: new InMemoryCache(),
})

// GraphQL Queries for BitrPredict
export const GET_POOLS = gql`
  query GetPools($first: Int, $skip: Int) {
    pools(first: $first, skip: $skip, orderBy: timestamp, orderDirection: desc) {
      id
      creator
      eventStartTime
      eventEndTime
      oracleType
      marketId
      marketType
      league
      category
      result
      creatorSideWon
      timestamp
      bets {
        bettor
        amount
        isForOutcome
        timestamp
      }
      liquidity {
        provider
        amount
        timestamp
      }
    }
  }
`

export const GET_USER_POOLS = gql`
  query GetUserPools($creator: String!) {
    pools(where: { creator: $creator }, orderBy: timestamp, orderDirection: desc) {
      id
      eventStartTime
      eventEndTime
      marketType
      league
      category
      result
      creatorSideWon
      timestamp
      bets {
        bettor
        amount
        isForOutcome
      }
    }
  }
`

export const GET_USER_STATS = gql`
  query GetUserStats($user: String!) {
    userStats(id: $user) {
      totalBets
      totalWinnings
      totalStaked
      reputation
      oddysseyWins
      lastActivity
    }
  }
`

export const GET_ODDYSSEY_CYCLES = gql`
  query GetOddysseyCycles($first: Int, $skip: Int) {
    oddysseyCycles(first: $first, skip: $skip, orderBy: endTime, orderDirection: desc) {
      id
      endTime
      prizePool
      isResolved
      slips {
        player
        timestamp
      }
      prizes {
        player
        rank
        amount
      }
    }
  }
`

export const GET_STAKING_EVENTS = gql`
  query GetStakingEvents($user: String!, $first: Int, $skip: Int) {
    stakingEvents(
      where: { user: $user }
      first: $first
      skip: $skip
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      amount
      tier
      duration
      eventType
      timestamp
    }
  }
`

export const GET_PLATFORM_STATS = gql`
  query GetPlatformStats {
    platformStats {
      totalPools
      totalVolume
      totalUsers
      totalStaked
      lastUpdated
    }
  }
`

export const GET_REPUTATION_UPDATES = gql`
  query GetReputationUpdates($user: String!, $first: Int, $skip: Int) {
    reputationUpdates(
      where: { user: $user }
      first: $first
      skip: $skip
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      oldReputation
      newReputation
      timestamp
    }
  }
`

export const GET_FAUCET_CLAIMS = gql`
  query GetFaucetClaims($user: String!, $first: Int, $skip: Int) {
    faucetClaims(
      where: { user: $user }
      first: $first
      skip: $skip
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      amount
      timestamp
    }
  }
`

export const GET_TOKEN_TRANSFERS = gql`
  query GetTokenTransfers($user: String!, $first: Int, $skip: Int) {
    tokenTransfers(
      where: { from: $user, to: $user }
      first: $first
      skip: $skip
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      from
      to
      value
      timestamp
    }
  }
`

// Real-time subscriptions
export const POOL_CREATED_SUBSCRIPTION = gql`
  subscription PoolCreated {
    pools(where: { timestamp_gte: "0" }, orderBy: timestamp, orderDirection: desc, first: 1) {
      id
      creator
      eventStartTime
      eventEndTime
      marketType
      league
      category
      timestamp
    }
  }
`

export const BET_PLACED_SUBSCRIPTION = gql`
  subscription BetPlaced {
    bets(orderBy: timestamp, orderDirection: desc, first: 1) {
      id
      pool
      bettor
      amount
      isForOutcome
      timestamp
    }
  }
`
