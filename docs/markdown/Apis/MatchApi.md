# MatchApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**matchControllerCreate**](MatchApi.md#matchControllerCreate) | **POST** /api/match | Play a match between two lineups |
| [**matchControllerFindAll**](MatchApi.md#matchControllerFindAll) | **GET** /api/match | List current user&#39;s matches (paginated) |
| [**matchControllerFindOne**](MatchApi.md#matchControllerFindOne) | **GET** /api/match/{id} | Get match by ID |


<a name="matchControllerCreate"></a>
# **matchControllerCreate**
> MatchResponseDto matchControllerCreate(CreateMatchDto)

Play a match between two lineups

    Submit two collections (each with exactly 9 players). A winner is decided (e.g. coin toss) and the result is stored.

### Parameters

|Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **CreateMatchDto** | [**CreateMatchDto**](../Models/CreateMatchDto.md)|  | |

### Return type

[**MatchResponseDto**](../Models/MatchResponseDto.md)

### Authorization

[defaultBearerAuth](../README.md#defaultBearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

<a name="matchControllerFindAll"></a>
# **matchControllerFindAll**
> PaginatedMatchResponseDto matchControllerFindAll(page, limit)

List current user&#39;s matches (paginated)

### Parameters

|Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **page** | **BigDecimal**|  | [optional] [default to 1] |
| **limit** | **BigDecimal**|  | [optional] [default to 20] |

### Return type

[**PaginatedMatchResponseDto**](../Models/PaginatedMatchResponseDto.md)

### Authorization

[defaultBearerAuth](../README.md#defaultBearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

<a name="matchControllerFindOne"></a>
# **matchControllerFindOne**
> MatchResponseDto matchControllerFindOne(id)

Get match by ID

### Parameters

|Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | **String**| Match ID | [default to null] |

### Return type

[**MatchResponseDto**](../Models/MatchResponseDto.md)

### Authorization

[defaultBearerAuth](../README.md#defaultBearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

