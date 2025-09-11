import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // const { searchParams } = new URL(request.url);
    // const date = searchParams.get('date'); // Optional: specific date - not currently used

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://bitr-backend.fly.dev';
    // Use fixtures/upcoming endpoint to get data with correct odds from database
    const url = `${backendUrl}/api/fixtures/upcoming`;

    console.log('🎯 Fetching Oddyssey matches from database via:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add timeout for better error handling
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      console.error(`Backend responded with status: ${response.status}`);
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Backend database response:', data);

    // Transform the database fixtures data to match the expected format
    const transformMatches = (matches: Array<{
      id: string;
      name: string;
      homeTeam: { id: string; name: string; logoUrl: string };
      awayTeam: { id: string; name: string; logoUrl: string };
      league: { id: string; name: string };
      matchDate: string;
      startingAt: string;
      home_odds: number | null;
      draw_odds: number | null;
      away_odds: number | null;
      over_25_odds: number | null;
      under_25_odds: number | null;
    }>) => {
      return matches.map((match, index) => {
        return {
          id: parseInt(match.id), // Convert string ID to number
          fixture_id: parseInt(match.id),
          home_team: match.homeTeam.name,
          away_team: match.awayTeam.name,
          match_date: match.matchDate || match.startingAt,
          league_name: match.league.name,
          home_odds: match.home_odds || 2.0, // Use database odds directly (no scaling needed)
          draw_odds: match.draw_odds || 3.0,
          away_odds: match.away_odds || 2.5,
          over_odds: match.over_25_odds || 1.8,
          under_odds: match.under_25_odds || 2.0,
          market_type: 'moneyline',
          display_order: index + 1
        };
      });
    };

    // Transform database fixtures data to expected format
    const transformedData = {
      today: {
        date: new Date().toISOString().split('T')[0],
        matches: transformMatches(data.matches || []), // Use 'matches' property from fixtures response
        count: data.matches?.length || 0
      },
      tomorrow: {
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        matches: [],
        count: 0
      },
      yesterday: {
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        matches: [],
        count: 0
      }
    };

    console.log('✅ Transformed data:', transformedData);

    return NextResponse.json({
      success: true,
      data: transformedData,
      message: 'Oddyssey matches fetched successfully'
    });

  } catch (error) {
    console.error('❌ Error fetching Oddyssey matches:', error);

    // Return mock data as fallback
    const generateMockMatches = (date: string, count: number = 5) => {
      return Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        fixture_id: i + 1,
        home_team: `Team ${i + 1}A`,
        away_team: `Team ${i + 1}B`,
        match_date: date,
        league_name: 'Mock League',
        home_odds: 2.0 + Math.random() * 1.5,
        draw_odds: 3.0 + Math.random() * 1.0,
        away_odds: 2.5 + Math.random() * 1.5,
        over_odds: 1.8 + Math.random() * 0.8,
        under_odds: 2.0 + Math.random() * 0.8,
        market_type: 'moneyline',
        display_order: i + 1
      }));
    };

    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const mockData = {
      today: {
        date: today,
        matches: generateMockMatches(today)
      },
      tomorrow: {
        date: tomorrow,
        matches: generateMockMatches(tomorrow)
      },
      yesterday: {
        date: yesterday,
        matches: generateMockMatches(yesterday)
      }
    };

    return NextResponse.json({
      success: true,
      data: mockData,
      message: 'Using mock data - backend connection failed'
    });
  }
} 