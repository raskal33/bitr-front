/**
 * Professional Title Generation Service for Prediction Markets
 * Generates meaningful, professional titles for pool cards
 */

export interface TitleGenerationData {
  marketType: string;
  homeTeam?: string;
  awayTeam?: string;
  predictedOutcome: string;
  cryptoData?: {
    symbol: string;
    direction: 'above' | 'below';
    targetPrice: number;
    timeframe?: string;
  };
}

export class TitleGenerationService {
  /**
   * Generate professional title for any market type
   */
  static generateTitle(data: TitleGenerationData): string {
    const { marketType, homeTeam, awayTeam, predictedOutcome, cryptoData } = data;

    // Handle crypto markets
    if (marketType === 'CRYPTO' && cryptoData) {
      return this.generateCryptoTitle(cryptoData);
    }

    // Handle football markets
    if (homeTeam && awayTeam) {
      return this.generateFootballTitle(marketType, homeTeam, awayTeam, predictedOutcome);
    }

    // Fallback for unknown markets
    return this.generateFallbackTitle(predictedOutcome);
  }

  /**
   * Generate professional football titles
   */
  private static generateFootballTitle(
    marketType: string, 
    homeTeam: string, 
    awayTeam: string, 
    predictedOutcome: string
  ): string {
    const templates = {
      // Moneyline markets (1X2)
      '1X2': {
        'Home wins': `${homeTeam} will beat ${awayTeam} at home!`,
        'Away wins': `${awayTeam} will beat ${homeTeam} away!`,
        'Draw': `${homeTeam} vs ${awayTeam} will end in a draw!`,
        '1': `${homeTeam} will beat ${awayTeam} at home!`,
        '2': `${awayTeam} will beat ${homeTeam} away!`,
        'X': `${homeTeam} vs ${awayTeam} will end in a draw!`
      },

      // Over/Under markets
      'OU05': {
        'Over 0.5 goals': `${homeTeam} vs ${awayTeam} will have over 0.5 goals!`,
        'Under 0.5 goals': `${homeTeam} vs ${awayTeam} will have under 0.5 goals!`
      },
      'OU15': {
        'Over 1.5 goals': `${homeTeam} vs ${awayTeam} will have over 1.5 goals!`,
        'Under 1.5 goals': `${homeTeam} vs ${awayTeam} will have under 1.5 goals!`
      },
      'OU25': {
        'Over 2.5 goals': `${homeTeam} vs ${awayTeam} will have over 2.5 goals!`,
        'Under 2.5 goals': `${homeTeam} vs ${awayTeam} will have under 2.5 goals!`
      },
      'OU35': {
        'Over 3.5 goals': `${homeTeam} vs ${awayTeam} will have over 3.5 goals!`,
        'Under 3.5 goals': `${homeTeam} vs ${awayTeam} will have under 3.5 goals!`
      },

      // Both Teams To Score
      'BTTS': {
        'Both teams to score': `Both ${homeTeam} and ${awayTeam} will score!`,
        'Not both teams to score': `Not both ${homeTeam} and ${awayTeam} will score!`
      },

      // Half Time markets
      'HT_1X2': {
        'Home wins': `${homeTeam} will lead at half-time!`,
        'Away wins': `${awayTeam} will lead at half-time!`,
        'Draw': `${homeTeam} vs ${awayTeam} will be tied at half-time!`
      },
      'HT_OU15': {
        'Over 1.5 goals': `${homeTeam} vs ${awayTeam} will have over 1.5 goals at half-time!`,
        'Under 1.5 goals': `${homeTeam} vs ${awayTeam} will have under 1.5 goals at half-time!`
      },

      // Double Chance
      'DC': {
        '1X': `${homeTeam} will not lose!`,
        '12': `${homeTeam} vs ${awayTeam} will not end in a draw!`,
        'X2': `${awayTeam} will not lose!`
      },

      // Half Time/Full Time
      'HTFT': {
        'Home/Home': `${homeTeam} will lead at half-time and win!`,
        'Home/Draw': `${homeTeam} will lead at half-time but draw!`,
        'Home/Away': `${homeTeam} will lead at half-time but lose!`,
        'Draw/Home': `${homeTeam} vs ${awayTeam} will be tied at half-time but ${homeTeam} will win!`,
        'Draw/Draw': `${homeTeam} vs ${awayTeam} will be tied at half-time and full-time!`,
        'Draw/Away': `${homeTeam} vs ${awayTeam} will be tied at half-time but ${awayTeam} will win!`,
        'Away/Home': `${awayTeam} will lead at half-time but lose!`,
        'Away/Draw': `${awayTeam} will lead at half-time but draw!`,
        'Away/Away': `${awayTeam} will lead at half-time and win!`
      }
    };

    // Get templates for this market type
    const marketTemplates = templates[marketType as keyof typeof templates];
    if (!marketTemplates) {
      // Fallback for unknown market types
      return `${homeTeam} vs ${awayTeam} - ${predictedOutcome}!`;
    }

    // Find exact match for predicted outcome
    if (marketTemplates[predictedOutcome as keyof typeof marketTemplates]) {
      return marketTemplates[predictedOutcome as keyof typeof marketTemplates];
    }

    // Try partial matches
    for (const [key, template] of Object.entries(marketTemplates)) {
      if (predictedOutcome.toLowerCase().includes(key.toLowerCase()) || 
          key.toLowerCase().includes(predictedOutcome.toLowerCase())) {
        return template;
      }
    }

    // Fallback template
    return `${homeTeam} vs ${awayTeam} - ${predictedOutcome}!`;
  }

  /**
   * Generate professional crypto titles
   */
  private static generateCryptoTitle(cryptoData: {
    symbol: string;
    direction: 'above' | 'below';
    targetPrice: number;
    timeframe?: string;
  }): string {
    const { symbol, direction, targetPrice, timeframe } = cryptoData;
    
    const priceFormatted = targetPrice >= 1 
      ? targetPrice.toLocaleString() 
      : targetPrice.toFixed(6);
    
    if (timeframe) {
      const timeMap: Record<string, string> = {
        '1h': '1 hour',
        '4h': '4 hours', 
        '1d': '1 day',
        '1w': '1 week',
        '1m': '1 month'
      };
      
      const timeText = timeMap[timeframe] || timeframe;
      
      if (direction === 'above') {
        return `${symbol} will reach above $${priceFormatted} in ${timeText}!`;
      } else {
        return `${symbol} will drop below $${priceFormatted} in ${timeText}!`;
      }
    } else {
      if (direction === 'above') {
        return `${symbol} will go above $${priceFormatted}!`;
      } else {
        return `${symbol} will go below $${priceFormatted}!`;
      }
    }
  }

  /**
   * Generate fallback title for unknown markets
   */
  private static generateFallbackTitle(predictedOutcome: string): string {
    return `${predictedOutcome}!`;
  }

  /**
   * Generate short title for compact displays
   */
  static generateShortTitle(data: TitleGenerationData): string {
    const { marketType, homeTeam, awayTeam, predictedOutcome, cryptoData } = data;

    // Handle crypto markets
    if (marketType === 'CRYPTO' && cryptoData) {
      const { symbol, direction, targetPrice } = cryptoData;
      const priceFormatted = targetPrice >= 1 
        ? targetPrice.toLocaleString() 
        : targetPrice.toFixed(2);
      return `${symbol} ${direction} $${priceFormatted}`;
    }

    // Handle football markets
    if (homeTeam && awayTeam) {
      const shortTemplates = {
        '1X2': {
          'Home wins': `${homeTeam} will win`,
          'Away wins': `${awayTeam} will win`,
          'Draw': `${homeTeam} vs ${awayTeam} draw`,
          '1': `${homeTeam} will win`,
          '2': `${awayTeam} will win`,
          'X': `${homeTeam} vs ${awayTeam} draw`
        },
        'OU25': {
          'Over 2.5 goals': `${homeTeam} vs ${awayTeam} over 2.5`,
          'Under 2.5 goals': `${homeTeam} vs ${awayTeam} under 2.5`
        },
        'BTTS': {
          'Both teams to score': `${homeTeam} vs ${awayTeam} both score`,
          'Not both teams to score': `${homeTeam} vs ${awayTeam} not both score`
        }
      };

      const marketTemplates = shortTemplates[marketType as keyof typeof shortTemplates];
      if (marketTemplates && marketTemplates[predictedOutcome as keyof typeof marketTemplates]) {
        return marketTemplates[predictedOutcome as keyof typeof marketTemplates];
      }

      return `${homeTeam} vs ${awayTeam}`;
    }

    return predictedOutcome;
  }

  /**
   * Generate event name for crypto markets
   */
  static generateEventName(data: TitleGenerationData): string {
    const { marketType, cryptoData } = data;

    if (marketType === 'CRYPTO' && cryptoData) {
      const { symbol, direction, targetPrice } = cryptoData;
      const priceFormatted = targetPrice >= 1 
        ? targetPrice.toLocaleString() 
        : targetPrice.toFixed(2);
      
      if (direction === 'above') {
        return `${symbol} Above $${priceFormatted}`;
      } else {
        return `${symbol} Below $${priceFormatted}`;
      }
    }

    return data.predictedOutcome;
  }
}

export default TitleGenerationService;
