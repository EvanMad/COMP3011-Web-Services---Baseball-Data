# TeamsApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**teamsControllerFindAll**](TeamsApi.md#teamsControllerFindAll) | **GET** /api/teams | List teams (paginated, optional league/year filters) |
| [**teamsControllerFindAllYears**](TeamsApi.md#teamsControllerFindAllYears) | **GET** /api/teams/{id} | List all years for a team (paginated) |
| [**teamsControllerFindOneTeam**](TeamsApi.md#teamsControllerFindOneTeam) | **GET** /api/teams/{id}/{year} | Get team by ID and year |
| [**teamsControllerRemove**](TeamsApi.md#teamsControllerRemove) | **DELETE** /api/teams/{id} | Remove a single team record |


<a name="teamsControllerFindAll"></a>
# **teamsControllerFindAll**
> PaginatedTeamResponseDto teamsControllerFindAll(page, limit, league, year)

List teams (paginated, optional league/year filters)

### Parameters

|Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **page** | **BigDecimal**|  | [optional] [default to 1] |
| **limit** | **BigDecimal**|  | [optional] [default to 20] |
| **league** | **String**|  | [optional] [default to null] |
| **year** | **BigDecimal**|  | [optional] [default to null] |

### Return type

[**PaginatedTeamResponseDto**](../Models/PaginatedTeamResponseDto.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

<a name="teamsControllerFindAllYears"></a>
# **teamsControllerFindAllYears**
> PaginatedTeamResponseDto teamsControllerFindAllYears(id, page, limit, league, year)

List all years for a team (paginated)

    Returns team records for the given team ID across seasons. Use query param &#x60;year&#x60; to filter. The team ID here is the franchise/team identifier (e.g. BOS), not the numeric primary key.

### Parameters

|Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | **String**| Team ID (e.g. BOS, NYA) | [default to null] |
| **page** | **BigDecimal**|  | [optional] [default to 1] |
| **limit** | **BigDecimal**|  | [optional] [default to 20] |
| **league** | **String**|  | [optional] [default to null] |
| **year** | **BigDecimal**|  | [optional] [default to null] |

### Return type

[**PaginatedTeamResponseDto**](../Models/PaginatedTeamResponseDto.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

<a name="teamsControllerFindOneTeam"></a>
# **teamsControllerFindOneTeam**
> TeamResponseDto teamsControllerFindOneTeam(id, year)

Get team by ID and year

### Parameters

|Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | **String**| Team ID | [default to null] |
| **year** | **BigDecimal**| Year | [default to null] |

### Return type

[**TeamResponseDto**](../Models/TeamResponseDto.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

<a name="teamsControllerRemove"></a>
# **teamsControllerRemove**
> teamsControllerRemove(id)

Remove a single team record

    Deletes one team record by its numeric primary key (internal id). This removes a single season entry, not all years for a franchise. To delete by teamID and year, use the id of the corresponding record.

### Parameters

|Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | **String**| Numeric primary key of the team record to delete (one season) | [default to null] |

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

