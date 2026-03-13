# AuthApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**authControllerSignIn**](AuthApi.md#authControllerSignIn) | **POST** /api/auth/login | Log in |
| [**authControllerSignUp**](AuthApi.md#authControllerSignUp) | **POST** /api/auth/register | Register |


<a name="authControllerSignIn"></a>
# **authControllerSignIn**
> AuthResponseDto authControllerSignIn(SignInDto)

Log in

    Returns a JWT access token.

### Parameters

|Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **SignInDto** | [**SignInDto**](../Models/SignInDto.md)|  | |

### Return type

[**AuthResponseDto**](../Models/AuthResponseDto.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

<a name="authControllerSignUp"></a>
# **authControllerSignUp**
> AuthResponseDto authControllerSignUp(SignUpDto)

Register

    Create a new user and return a JWT access token.

### Parameters

|Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **SignUpDto** | [**SignUpDto**](../Models/SignUpDto.md)|  | |

### Return type

[**AuthResponseDto**](../Models/AuthResponseDto.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

