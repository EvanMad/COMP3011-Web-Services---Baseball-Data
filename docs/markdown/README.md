# Documentation for Web Services API

<a name="documentation-for-api-endpoints"></a>
## Documentation for API Endpoints

All URIs are relative to *http://localhost*

| Class | Method | HTTP request | Description |
|------------ | ------------- | ------------- | -------------|
| *AnalyticsApi* | [**analyticsControllerGetLeagueLeaders**](Apis/AnalyticsApi.md#analyticsControllerGetLeagueLeaders) | **GET** /analytics/league-leaders | Get league leaders for a stat |
| *AppApi* | [**appControllerGetStatus**](Apis/AppApi.md#appControllerGetStatus) | **GET** /health | Health / welcome |
| *AuthApi* | [**authControllerSignIn**](Apis/AuthApi.md#authControllerSignIn) | **POST** /auth/login | Log in |
*AuthApi* | [**authControllerSignUp**](Apis/AuthApi.md#authControllerSignUp) | **POST** /auth/register | Register |
| *CollectionApi* | [**collectionControllerCreate**](Apis/CollectionApi.md#collectionControllerCreate) | **POST** /collection | Create a collection |
*CollectionApi* | [**collectionControllerFindAll**](Apis/CollectionApi.md#collectionControllerFindAll) | **GET** /collection | List current user's collections (paginated) |
*CollectionApi* | [**collectionControllerFindOne**](Apis/CollectionApi.md#collectionControllerFindOne) | **GET** /collection/{id} | Get collection by ID |
*CollectionApi* | [**collectionControllerRemove**](Apis/CollectionApi.md#collectionControllerRemove) | **DELETE** /collection/{id} | Delete collection |
*CollectionApi* | [**collectionControllerUpdate**](Apis/CollectionApi.md#collectionControllerUpdate) | **PATCH** /collection/{id} | Update collection |
| *MatchApi* | [**matchControllerCreate**](Apis/MatchApi.md#matchControllerCreate) | **POST** /match | Play a match between two lineups |
*MatchApi* | [**matchControllerFindAll**](Apis/MatchApi.md#matchControllerFindAll) | **GET** /match | List current user's matches (paginated) |
*MatchApi* | [**matchControllerFindOne**](Apis/MatchApi.md#matchControllerFindOne) | **GET** /match/{id} | Get match by ID |
| *PlayerApi* | [**playerControllerCreatePlayer**](Apis/PlayerApi.md#playerControllerCreatePlayer) | **POST** /player | Create player (admin) |
*PlayerApi* | [**playerControllerDeletePlayer**](Apis/PlayerApi.md#playerControllerDeletePlayer) | **DELETE** /player/{id} | Delete player (admin) |
*PlayerApi* | [**playerControllerGetAllPlayers**](Apis/PlayerApi.md#playerControllerGetAllPlayers) | **GET** /player | List players (paginated, optional filters) |
*PlayerApi* | [**playerControllerGetPlayerById**](Apis/PlayerApi.md#playerControllerGetPlayerById) | **GET** /player/{id} | Get player by ID |
*PlayerApi* | [**playerControllerUpdatePlayer**](Apis/PlayerApi.md#playerControllerUpdatePlayer) | **PATCH** /player/{id} | Update player (admin) |
| *TeamsApi* | [**teamsControllerFindAll**](Apis/TeamsApi.md#teamsControllerFindAll) | **GET** /teams | List teams (paginated, optional league/year filters) |
*TeamsApi* | [**teamsControllerFindAllYears**](Apis/TeamsApi.md#teamsControllerFindAllYears) | **GET** /teams/{id} | List all years for a team (paginated) |
*TeamsApi* | [**teamsControllerFindOneTeam**](Apis/TeamsApi.md#teamsControllerFindOneTeam) | **GET** /teams/{id}/{year} | Get team by ID and year |
*TeamsApi* | [**teamsControllerRemove**](Apis/TeamsApi.md#teamsControllerRemove) | **DELETE** /teams/{id} | Remove a single team record |


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

