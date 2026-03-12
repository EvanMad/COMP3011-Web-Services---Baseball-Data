# AnalyticsApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**analyticsControllerGetLeagueLeaders**](AnalyticsApi.md#analyticsControllerGetLeagueLeaders) | **GET** /analytics/league-leaders | Get league leaders for a stat |


<a name="analyticsControllerGetLeagueLeaders"></a>
# **analyticsControllerGetLeagueLeaders**
> LeagueLeadersResponseDto analyticsControllerGetLeagueLeaders(category, stat, year, league, limit)

Get league leaders for a stat

    Returns the top players for a given batting or pitching stat. Optionally filter by year and league. For rate stats (e.g. battingAverage), only players with at least 100 AB are included. ERA leaders are sorted ascending (lower is better).

### Parameters

|Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **category** | **String**| Stat category | [default to null] [enum: batting, pitching] |
| **stat** | **String**| Stat to rank by. Must match category (e.g. batting + homeRuns, pitching + strikeouts). | [default to null] [enum: homeRuns, hits, runs, rbi, stolenBases, walks, battingAverage, onBasePercentage, sluggingPercentage, wins, strikeouts, losses, era] |
| **year** | **BigDecimal**| Season year (omit for career totals) | [optional] [default to null] |
| **league** | **String**| League ID (e.g. AL, NL) | [optional] [default to null] |
| **limit** | **BigDecimal**| Number of leaders (default 10, max 100) | [optional] [default to 10] |

### Return type

[**LeagueLeadersResponseDto**](../Models/LeagueLeadersResponseDto.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

