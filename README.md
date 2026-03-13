# Evan's Super Cool Baseball Stats API
*Evan's Super Cool Baseball Stats API* is my project submitted for COMP3011 Web Services and Web Data at the University of Leeds.

It aims to provide a programmatic interface to large baseball statistics datasets, allowing developers to integrate this data into other applications. The API exposes endpoints for querying players, teams, and season records drawn from the [Lahman Baseball Database](https://sabr.org/lahman-database/), alongside analytical endpoints for league leaders and computed sabermetric statistics. It also supports user authentication, personal player collections, and a fantasy match system — and exposes an [MCP server](https://modelcontextprotocol.io/) for querying the data directly via an LLM.

## Architecture

Built with **TypeScript** on **NestJS**, following a modular Controller → Service pattern with **Prisma ORM** backed by **PostgreSQL**.

| Layer | Technology |
|---|---|
| Language | TypeScript |
| Web Framework | NestJS |
| ORM | Prisma |
| Database | PostgreSQL |
| Testing | Jest + Testcontainers |
| CI/CD | GitHub Actions |
| Deployment | Render |

## Project setup instructions
### Prerequisites
- NodeJS Version >20
- PostgreSQL version >18

### Database seeding
The database must be seeded to add in the relevant baseball data. This can be done with:
```bash
$ npx tsx prisma/seed.ts
```

### Commands to start local development server
```bash
$ npm install
```

```bash
$ npm run sync
```

```bash
$ npm run start:dev
```

You may also want to rebuild the frontend

```bash
$ cd frontend
$ npm run build
```

## Run tests

```bash
# unit tests
$ npm run test:unit

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Format and Linting
Formatting and Linting is setup with Prettier and ESLint.

```bash
$ npm run format
```

```bash
$ npm run lint
```

## API documentation
OpenAPI (Swagger) docs are available at `/docs` when the app is running.

A rendered version of this documentation is also available in the `/docs` directory. This can be re-generated with
```bash
$ npm run doc
```

PDF documentation can be found at docs/pdf/docs.pdf

## Database
This application uses a [PostgreSQL](https://www.postgresql.org/) database with [Prisma ORM](https://www.prisma.io/). After any schema updates you must re-sync and generate the Prisma client library with:

```bash
$ npm run sync
```

## MCP Server
An MCP Server is hosted on /api/mcp. There are a few tools implemented there for player + team searching as well as some analytical endpoints.

## Data source
All data was sourced from the [Lahman Baseball Database](https://sabr.org/lahman-database/), created by Sean Lahman and maintained by Bryan Walko at [SABR](https://sabr.org/). Licenced under Creative Commons Attribution-ShareAlike 3.0 Unported (CC BY-SA 3.0) license.

## Deployment
The application is currently deployed at [comp3011.evanmadurai.co.uk](https://comp3011.evanmadurai.co.uk/).

This deployment is handled by [Render](https://render.com/). This was chosen as it seemed like a relatively easy and cheap place to deploy a web application with a PostgreSQL instance with good support for Github CI/CD based deployments.

Deploying a new version is done automatically on any push or merge into the main branch of the Github remote repo.

## Use of Artificial Intelligence
Artificial Intelligence tools (such as Anthropic's *Claude* and and Google's *Gemini*) were used for both brainstorming ideas and generating code features. All code has been manually checked and approved by a human (me).

## License

This project is [MIT licensed](https://opensource.org/license/mit).