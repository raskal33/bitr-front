import { apiRequest, API_CONFIG } from '@/config/api';

// ============================================================================
// ANALYTICS SERVICE - Real-time platform statistics integration
// ============================================================================

export interface GlobalStats {
  totalVolume: number;
  totalPools: number;
  totalBets: number;
  activePools: number;
}

export interface VolumeHistoryItem {
  date: string;
  volume: number;
  pools: number;
  users: number;
}

export interface CategoryStats {
  category: string;
  poolCount: number;
  totalVolume: number;
  avgPoolSize: number;
  participantCount: number;
}

export interface EnhancedCategoryStats {
  category_name: string;
  total_pools: number;
  total_volume: number;
  total_participants: number;
  avg_pool_size: number;
  most_popular_market_type: number;
  most_popular_market_type_name: string;
  last_activity: string;
  icon: string;
  color: string;
}

export interface LeagueStats {
  league_name: string;
  total_pools: number;
  total_volume: number;
  total_participants: number;
  avg_pool_size: number;
  most_popular_market_type: number;
  most_popular_market_type_name: string;
  last_activity: string;
}

export interface UserStats {
  user_address: string;
  total_bets: number;
  total_bet_amount: number;
  total_liquidity: number;
  total_liquidity_amount: number;
  total_pools_created: number;
  total_volume: number;
  win_count: number;
  loss_count: number;
  reputation_score: number;
  last_activity: string;
  win_rate: string;
  total_activity: number;
  avg_bet_size: string;
  avg_liquidity_size: string;
  reputation_tier: string;
}

export interface MarketTypeStats {
  market_type: number;
  market_type_name: string;
  total_pools: number;
  total_volume: number;
  total_participants: number;
  avg_pool_size: number;
  win_rate: number;
  last_activity: string;
  icon: string;
  description: string;
  color: string;
}

export interface CategoryDistribution {
  [category: string]: number;
}

export interface UserActivityItem {
  hour: string;
  users: number;
  volume: number;
  bets: number;
}

export interface TopCreator {
  address: string;
  shortAddress: string;
  reputation: number;
  stats: {
    totalPools: number;
    totalVolume: number;
    winRate: number;
  };
}

export interface TopBettor {
  address: string;
  shortAddress: string;
  stats: {
    totalBets: number;
    wonBets: number;
    totalStaked: number;
    totalWinnings: number;
    winRate: number;
    profitLoss: number;
    biggestWin: number;
    currentStreak: number;
    maxWinStreak: number;
    streakIsWin: boolean;
  };
  joinedAt: string;
}

export interface AnalyticsResponse<T> {
  success: boolean;
  data: T;
  timeframe?: string;
}

export class AnalyticsService {
  private static baseURL = API_CONFIG.endpoints.analytics || '/api/analytics';

  /**
   * Get global platform statistics
   */
  static async getGlobalStats(timeframe: '24h' | '7d' | '30d' | 'all' = '7d'): Promise<GlobalStats> {
    const response = await apiRequest<AnalyticsResponse<GlobalStats>>(
      `${this.baseURL}/global?timeframe=${timeframe}`
    );
    return response.data;
  }

  /**
   * Get volume history for charts
   */
  static async getVolumeHistory(timeframe: '24h' | '7d' | '30d' = '7d'): Promise<VolumeHistoryItem[]> {
    const response = await apiRequest<AnalyticsResponse<VolumeHistoryItem[]>>(
      `${this.baseURL}/volume-history?timeframe=${timeframe}`
    );
    return response.data;
  }

  /**
   * Get category statistics and distribution
   */
  static async getCategoryStats(timeframe: '24h' | '7d' | '30d' | 'all' = '7d'): Promise<{
    distribution: CategoryDistribution;
    detailed: CategoryStats[];
  }> {
    const response = await apiRequest<AnalyticsResponse<{
      distribution: CategoryDistribution;
      detailed: CategoryStats[];
    }>>(
      `${this.baseURL}/categories?timeframe=${timeframe}`
    );
    return response.data;
  }

  /**
   * Get top pool creators leaderboard
   */
  static async getTopCreators(limit: number = 10, sortBy: 'total_volume' | 'win_rate' | 'total_pools' = 'total_volume'): Promise<TopCreator[]> {
    const response = await apiRequest<AnalyticsResponse<TopCreator[]>>(
      `${this.baseURL}/leaderboard/creators?limit=${limit}&sortBy=${sortBy}`
    );
    return response.data;
  }

  /**
   * Get top bettors leaderboard
   */
  static async getTopBettors(limit: number = 10, sortBy: 'profit_loss' | 'total_volume' | 'win_rate' | 'total_bets' = 'profit_loss'): Promise<TopBettor[]> {
    const response = await apiRequest<AnalyticsResponse<TopBettor[]>>(
      `${this.baseURL}/leaderboard/bettors?limit=${limit}&sortBy=${sortBy}`
    );
    return response.data;
  }

  /**
   * Get hourly user activity patterns
   */
  static async getUserActivity(): Promise<UserActivityItem[]> {
    const response = await apiRequest<AnalyticsResponse<UserActivityItem[]>>(
      `${this.baseURL}/user-activity`
    );
    return response.data;
  }

  /**
   * Get platform overview stats (combination of multiple endpoints)
   */
  static async getPlatformOverview(timeframe: '24h' | '7d' | '30d' | 'all' = '7d') {
    try {
      const [globalStats, volumeHistory, categoryStats, userActivity] = await Promise.all([
        this.getGlobalStats(timeframe),
        this.getVolumeHistory(timeframe === 'all' ? '30d' : timeframe),
        this.getCategoryStats(timeframe),
        this.getUserActivity()
      ]);

      return {
        globalStats,
        volumeHistory,
        categoryDistribution: categoryStats.distribution,
        categoryDetails: categoryStats.detailed,
        userActivity
      };
    } catch (error) {
      console.error('Error fetching platform overview:', error);
      throw error;
    }
  }

  /**
   * Get leaderboard data (creators and bettors)
   */
  static async getLeaderboards() {
    try {
      const [topCreators, topBettors] = await Promise.all([
        this.getTopCreators(10),
        this.getTopBettors(10)
      ]);

      return {
        topCreators,
        topBettors
      };
    } catch (error) {
      console.error('Error fetching leaderboards:', error);
      throw error;
    }
  }

  /**
   * Get enhanced category statistics
   */
  static async getEnhancedCategoryStats(
    limit: number = 10,
    offset: number = 0,
    sortBy: string = 'total_volume',
    sortOrder: string = 'desc'
  ): Promise<{ categories: EnhancedCategoryStats[]; pagination: any }> {
    // Use the existing categories endpoint since category-stats doesn't exist
    const response = await apiRequest<AnalyticsResponse<{
      distribution: CategoryDistribution;
      detailed: CategoryStats[];
    }>>(
      `${this.baseURL}/categories`
    );
    
    // Transform the response to match the expected format
    const categories: EnhancedCategoryStats[] = response.data.detailed.map((cat, index) => ({
      category_name: cat.category,
      total_pools: cat.poolCount,
      total_volume: cat.totalVolume,
      total_participants: cat.participantCount,
      avg_pool_size: cat.avgPoolSize,
      most_popular_market_type: 0,
      most_popular_market_type_name: 'Unknown',
      last_activity: new Date().toISOString(),
      icon: this.getCategoryIcon(cat.category),
      color: this.getCategoryColor(cat.category)
    }));
    
    return { categories, pagination: {} };
  }
  
  private static getCategoryIcon(category: string): string {
    switch (category.toLowerCase()) {
      case 'football': return '⚽';
      case 'basketball': return '🏀';
      case 'cryptocurrency': return '₿';
      case 'combo': return '⭐';
      default: return '🎯';
    }
  }
  
  private static getCategoryColor(category: string): string {
    switch (category.toLowerCase()) {
      case 'football': return '#22C7FF';
      case 'basketball': return '#FF6B35';
      case 'cryptocurrency': return '#F7931A';
      case 'combo': return '#9B59B6';
      default: return '#95A5A6';
    }
  }

  /**
   * Get league statistics
   */
  static async getLeagueStats(
    limit: number = 10,
    offset: number = 0,
    sortBy: string = 'total_volume',
    sortOrder: string = 'desc'
  ): Promise<{ leagues: LeagueStats[]; pagination: any }> {
    // League stats endpoint doesn't exist in backend, return empty data
    console.warn('League stats endpoint not available in backend');
    return { leagues: [], pagination: {} };
  }

  /**
   * Get user statistics
   */
  static async getUserStats(
    limit: number = 10,
    offset: number = 0,
    sortBy: string = 'total_volume',
    sortOrder: string = 'desc',
    userAddress?: string
  ): Promise<{ users: UserStats[]; pagination: any }> {
    // User stats endpoint doesn't exist in backend, return empty data
    console.warn('User stats endpoint not available in backend');
    return { users: [], pagination: {} };
  }

  /**
   * Get market type statistics
   */
  static async getMarketTypeStats(
    limit: number = 10,
    offset: number = 0,
    sortBy: string = 'total_volume',
    sortOrder: string = 'desc'
  ): Promise<{ marketTypes: MarketTypeStats[]; pagination: any }> {
    // Market type stats endpoint doesn't exist in backend, return empty data
    console.warn('Market type stats endpoint not available in backend');
    return { marketTypes: [], pagination: {} };
  }

  /**
   * Get comprehensive stats overview
   */
  static async getComprehensiveStats() {
    try {
      const [categoryStats, leagueStats, marketTypeStats, userStats] = await Promise.all([
        this.getEnhancedCategoryStats(5),
        this.getLeagueStats(5),
        this.getMarketTypeStats(8),
        this.getUserStats(10)
      ]);

      return {
        categoryStats,
        leagueStats,
        marketTypeStats,
        userStats
      };
    } catch (error) {
      console.error('Error fetching comprehensive stats:', error);
      throw error;
    }
  }
}

export default AnalyticsService; 