# CollectionApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**collectionControllerCreate**](CollectionApi.md#collectionControllerCreate) | **POST** /api/collection | Create a collection |
| [**collectionControllerFindAll**](CollectionApi.md#collectionControllerFindAll) | **GET** /api/collection | List current user&#39;s collections (paginated) |
| [**collectionControllerFindOne**](CollectionApi.md#collectionControllerFindOne) | **GET** /api/collection/{id} | Get collection by ID |
| [**collectionControllerRemove**](CollectionApi.md#collectionControllerRemove) | **DELETE** /api/collection/{id} | Delete collection |
| [**collectionControllerUpdate**](CollectionApi.md#collectionControllerUpdate) | **PATCH** /api/collection/{id} | Update collection |


<a name="collectionControllerCreate"></a>
# **collectionControllerCreate**
> CollectionResponseDto collectionControllerCreate(CreateCollectionDto)

Create a collection

### Parameters

|Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **CreateCollectionDto** | [**CreateCollectionDto**](../Models/CreateCollectionDto.md)|  | |

### Return type

[**CollectionResponseDto**](../Models/CollectionResponseDto.md)

### Authorization

[defaultBearerAuth](../README.md#defaultBearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

<a name="collectionControllerFindAll"></a>
# **collectionControllerFindAll**
> PaginatedCollectionResponseDto collectionControllerFindAll(page, limit, name)

List current user&#39;s collections (paginated)

### Parameters

|Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **page** | **BigDecimal**|  | [optional] [default to 1] |
| **limit** | **BigDecimal**|  | [optional] [default to 20] |
| **name** | **String**|  | [optional] [default to null] |

### Return type

[**PaginatedCollectionResponseDto**](../Models/PaginatedCollectionResponseDto.md)

### Authorization

[defaultBearerAuth](../README.md#defaultBearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

<a name="collectionControllerFindOne"></a>
# **collectionControllerFindOne**
> CollectionResponseDto collectionControllerFindOne(id)

Get collection by ID

### Parameters

|Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | **String**| Collection ID | [default to null] |

### Return type

[**CollectionResponseDto**](../Models/CollectionResponseDto.md)

### Authorization

[defaultBearerAuth](../README.md#defaultBearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

<a name="collectionControllerRemove"></a>
# **collectionControllerRemove**
> collectionControllerRemove(id)

Delete collection

### Parameters

|Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | **String**| Collection ID | [default to null] |

### Return type

null (empty response body)

### Authorization

[defaultBearerAuth](../README.md#defaultBearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

<a name="collectionControllerUpdate"></a>
# **collectionControllerUpdate**
> CollectionResponseDto collectionControllerUpdate(id, UpdateCollectionDto)

Update collection

### Parameters

|Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | **String**| Collection ID | [default to null] |
| **UpdateCollectionDto** | [**UpdateCollectionDto**](../Models/UpdateCollectionDto.md)|  | |

### Return type

[**CollectionResponseDto**](../Models/CollectionResponseDto.md)

### Authorization

[defaultBearerAuth](../README.md#defaultBearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

