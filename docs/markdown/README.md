# Documentation for Web Services API

<a name="documentation-for-api-endpoints"></a>
## Documentation for API Endpoints

All URIs are relative to *http://localhost*

| Class | Method | HTTP request | Description |
|------------ | ------------- | ------------- | -------------|
| *AnalyticsApi* | [**analyticsControllerGetLeagueLeaders**](Apis/AnalyticsApi.md#analyticsControllerGetLeagueLeaders) | **GET** /api/analytics/league-leaders | Get league leaders for a stat |
| *AppApi* | [**appControllerGetStatus**](Apis/AppApi.md#appControllerGetStatus) | **GET** /api/health | Health / welcome |
| *AuthApi* | [**authControllerSignIn**](Apis/AuthApi.md#authControllerSignIn) | **POST** /api/auth/login | Log in |
*AuthApi* | [**authControllerSignUp**](Apis/AuthApi.md#authControllerSignUp) | **POST** /api/auth/register | Register |
| *CollectionApi* | [**collectionControllerCreate**](Apis/CollectionApi.md#collectionControllerCreate) | **POST** /api/collection | Create a collection |
*CollectionApi* | [**collectionControllerFindAll**](Apis/CollectionApi.md#collectionControllerFindAll) | **GET** /api/collection | List current user's collections (paginated) |
*CollectionApi* | [**collectionControllerFindOne**](Apis/CollectionApi.md#collectionControllerFindOne) | **GET** /api/collection/{id} | Get collection by ID |
*CollectionApi* | [**collectionControllerRemove**](Apis/CollectionApi.md#collectionControllerRemove) | **DELETE** /api/collection/{id} | Delete collection |
*CollectionApi* | [**collectionControllerUpdate**](Apis/CollectionApi.md#collectionControllerUpdate) | **PATCH** /api/collection/{id} | Update collection |
| *MatchApi* | [**matchControllerCreate**](Apis/MatchApi.md#matchControllerCreate) | **POST** /api/match | Play a match between two lineups |
*MatchApi* | [**matchControllerFindAll**](Apis/MatchApi.md#matchControllerFindAll) | **GET** /api/match | List current user's matches (paginated) |
*MatchApi* | [**matchControllerFindOne**](Apis/MatchApi.md#matchControllerFindOne) | **GET** /api/match/{id} | Get match by ID |
| *PlayerApi* | [**playerControllerCreatePlayer**](Apis/PlayerApi.md#playerControllerCreatePlayer) | **POST** /api/player | Create player (admin) |
*PlayerApi* | [**playerControllerDeletePlayer**](Apis/PlayerApi.md#playerControllerDeletePlayer) | **DELETE** /api/player/{id} | Delete player (admin) |
*PlayerApi* | [**playerControllerGetAllPlayers**](Apis/PlayerApi.md#playerControllerGetAllPlayers) | **GET** /api/player | List players (paginated, optional filters) |
*PlayerApi* | [**playerControllerGetPlayerById**](Apis/PlayerApi.md#playerControllerGetPlayerById) | **GET** /api/player/{id} | Get player by ID |
*PlayerApi* | [**playerControllerUpdatePlayer**](Apis/PlayerApi.md#playerControllerUpdatePlayer) | **PATCH** /api/player/{id} | Update player (admin) |
| *SseApi* | [**sseControllerMessages**](Apis/SseApi.md#sseControllerMessages) | **POST** /api/messages |  |
*SseApi* | [**sseControllerSse**](Apis/SseApi.md#sseControllerSse) | **GET** /api/sse |  |
| *StreamableHttpApi* | [**streamableHttpControllerHandleDeleteRequest**](Apis/StreamableHttpApi.md#streamableHttpControllerHandleDeleteRequest) | **DELETE** /api/mcp |  |
*StreamableHttpApi* | [**streamableHttpControllerHandleGetRequest**](Apis/StreamableHttpApi.md#streamableHttpControllerHandleGetRequest) | **GET** /api/mcp |  |
*StreamableHttpApi* | [**streamableHttpControllerHandlePostRequest**](Apis/StreamableHttpApi.md#streamableHttpControllerHandlePostRequest) | **POST** /api/mcp |  |
| *TeamsApi* | [**teamsControllerFindAll**](Apis/TeamsApi.md#teamsControllerFindAll) | **GET** /api/teams | List teams (paginated, optional league/year filters) |
*TeamsApi* | [**teamsControllerFindAllYears**](Apis/TeamsApi.md#teamsControllerFindAllYears) | **GET** /api/teams/{id} | List all years for a team (paginated) |
*TeamsApi* | [**teamsControllerFindOneTeam**](Apis/TeamsApi.md#teamsControllerFindOneTeam) | **GET** /api/teams/{id}/{year} | Get team by ID and year |
*TeamsApi* | [**teamsControllerRemove**](Apis/TeamsApi.md#teamsControllerRemove) | **DELETE** /api/teams/{id} | Remove a single team record |


<a name="documentation-for-models"></a>
## Documentation for Models

 - [AuthResponseDto](./Models/AuthResponseDto.md)
 - [CareerBattingDto](./Models/CareerBattingDto.md)
 - [CareerHighsDto](./Models/CareerHighsDto.md)
 - [CareerPitchingDto](./Models/CareerPitchingDto.md)
 - [CollectionResponseDto](./Models/CollectionResponseDto.md)
 - [CreateBattingDto](./Models/CreateBattingDto.md)
 - [CreateCollectionDto](./Models/CreateCollectionDto.md)
 - [CreateMatchDto](./Models/CreateMatchDto.md)
 - [CreatePitchingDto](./Models/CreatePitchingDto.md)
 - [CreatePlayerDto](./Models/CreatePlayerDto.md)
 - [ErrorDto](./Models/ErrorDto.md)
 - [LeagueLeaderEntryDto](./Models/LeagueLeaderEntryDto.md)
 - [LeagueLeadersResponseDto](./Models/LeagueLeadersResponseDto.md)
 - [MatchResponseDto](./Models/MatchResponseDto.md)
 - [PaginatedCollectionResponseDto](./Models/PaginatedCollectionResponseDto.md)
 - [PaginatedMatchResponseDto](./Models/PaginatedMatchResponseDto.md)
 - [PaginatedPlayerResponseDto](./Models/PaginatedPlayerResponseDto.md)
 - [PaginatedTeamResponseDto](./Models/PaginatedTeamResponseDto.md)
 - [PaginationMetaDto](./Models/PaginationMetaDto.md)
 - [PitchingAllowedDto](./Models/PitchingAllowedDto.md)
 - [PlayerResponseDto](./Models/PlayerResponseDto.md)
 - [SignInDto](./Models/SignInDto.md)
 - [SignUpDto](./Models/SignUpDto.md)
 - [TeamResponseDto](./Models/TeamResponseDto.md)
 - [TeamResultsDto](./Models/TeamResultsDto.md)
 - [TeamStatsDto](./Models/TeamStatsDto.md)
 - [UpdateCollectionDto](./Models/UpdateCollectionDto.md)
 - [UpdatePlayerDto](./Models/UpdatePlayerDto.md)


<a name="documentation-for-authorization"></a>
## Documentation for Authorization

<a name="defaultBearerAuth"></a>
### defaultBearerAuth

- **Type**: HTTP Bearer Token authentication (JWT)

