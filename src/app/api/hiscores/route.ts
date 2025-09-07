/**
 * OSRS Hiscores API Proxy
 *
 * Next.js API route to proxy requests to OSRS hiscores API
 * This avoids CORS issues when fetching from the browser
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const HISCORES_API = {
  json: "https://secure.runescape.com/m=hiscore_oldschool/index_lite.json",
  csv: "https://secure.runescape.com/m=hiscore_oldschool/index_lite.ws",
} as const;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const player = searchParams.get("player");
  const format = searchParams.get("format") || "json";

  // Validate player parameter
  if (!player) {
    return NextResponse.json(
      { error: "Player parameter is required" },
      { status: 400 },
    );
  }

  // Clean and validate username
  const cleanPlayer = player.trim().replace(/[^a-zA-Z0-9_\- ]/g, "");
  if (!cleanPlayer) {
    return NextResponse.json(
      { error: "Invalid player name format" },
      { status: 400 },
    );
  }

  try {
    // Choose API endpoint based on format
    const apiUrl = format === "csv" ? HISCORES_API.csv : HISCORES_API.json;
    const url = `${apiUrl}?player=${encodeURIComponent(cleanPlayer)}`;

    // Make request to OSRS API
    const response = await fetch(url, {
      headers: {
        "User-Agent": "OSRS-Farming-Planner/1.0",
      },
      // Add timeout
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          {
            error: "Player not found on hiscores",
            message:
              "The player either doesn't exist or has skills too low to appear on hiscores.",
            type: "not_found",
          },
          { status: 404 },
        );
      }

      return NextResponse.json(
        {
          error: `Hiscores API error: ${response.status} ${response.statusText}`,
          type: "api_error",
        },
        { status: response.status },
      );
    }

    // Get response data
    const data =
      format === "csv" ? await response.text() : await response.json();

    // Return the data with appropriate headers
    return NextResponse.json({
      player: cleanPlayer,
      format,
      data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Hiscores API error:", error);

    if (error instanceof Error && error.name === "TimeoutError") {
      return NextResponse.json(
        {
          error: "Request timeout - OSRS hiscores API is slow or unavailable",
          type: "timeout",
        },
        { status: 408 },
      );
    }

    return NextResponse.json(
      {
        error: "Failed to fetch player data",
        message: error instanceof Error ? error.message : "Unknown error",
        type: "network_error",
      },
      { status: 500 },
    );
  }
}
