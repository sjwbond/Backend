# Backend

## Configuration

Create a database for storing the data and files.

Open the file `start.sh` and update the environment variables to match the PostgreSQL connection information

## Installation

```bash
$ npm install
```

## Running the app

```bash
./start.sh
```

## Development

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```