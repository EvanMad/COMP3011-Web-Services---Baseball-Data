# PlayerApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**playerControllerCreatePlayer**](PlayerApi.md#playerControllerCreatePlayer) | **POST** /player | Create player (admin) |
| [**playerControllerDeletePlayer**](PlayerApi.md#playerControllerDeletePlayer) | **DELETE** /player/{id} | Delete player (admin) |
| [**playerControllerGetAllPlayers**](PlayerApi.md#playerControllerGetAllPlayers) | **GET** /player | List players (paginated, optional filters) |
| [**playerControllerGetPlayerById**](PlayerApi.md#playerControllerGetPlayerById) | **GET** /player/{id} | Get player by ID |
| [**playerControllerUpdatePlayer**](PlayerApi.md#playerControllerUpdatePlayer) | **PATCH** /player/{id} | Update player (admin) |


<a name="playerControllerCreatePlayer"></a>
# **playerControllerCreatePlayer**
> PlayerResponseDto playerControllerCreatePlayer(CreatePlayerDto)

Create player (admin)

### Parameters

|Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **CreatePlayerDto** | [**CreatePlayerDto**](../Models/CreatePlayerDto.md)|  | |

### Return type

[**PlayerResponseDto**](../Models/PlayerResponseDto.md)

### Authorization

[defaultBearerAuth](../README.md#defaultBearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

<a name="playerControllerDeletePlayer"></a>
# **playerControllerDeletePlayer**
> playerControllerDeletePlayer(id)

Delete player (admin)

### Parameters

|Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | **String**| Player ID | [default to null] |

### Return type

null (empty response body)

### Authorization

[defaultBearerAuth](../README.md#defaultBearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

<a name="playerControllerGetAllPlayers"></a>
# **playerControllerGetAllPlayers**
> PaginatedPlayerResponseDto playerControllerGetAllPlayers(page, limit, name, birthCountry)

List players (paginated, optional filters)

### Parameters

|Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **page** | **BigDecimal**|  | [optional] [default to 1] |
| **limit** | **BigDecimal**|  | [optional] [default to 20] |
| **name** | **String**|  | [optional] [default to null] |
| **birthCountry** | **String**|  | [optional] [default to null] |

### Return type

[**PaginatedPlayerResponseDto**](../Models/PaginatedPlayerResponseDto.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

<a name="playerControllerGetPlayerById"></a>
# **playerControllerGetPlayerById**
> PlayerResponseDto playerControllerGetPlayerById(id)

Get player by ID

### Parameters

|Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | **String**| Player ID | [default to null] |

### Return type

[**PlayerResponseDto**](../Models/PlayerResponseDto.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

<a name="playerControllerUpdatePlayer"></a>
# **playerControllerUpdatePlayer**
> PlayerResponseDto playerControllerUpdatePlayer(id, UpdatePlayerDto)

Update player (admin)

### Parameters

|Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | **String**| Player ID | [default to null] |
| **UpdatePlayerDto** | [**UpdatePlayerDto**](../Models/UpdatePlayerDto.md)|  | |

### Return type

[**PlayerResponseDto**](../Models/PlayerResponseDto.md)

### Authorization

[defaultBearerAuth](../README.md#defaultBearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

