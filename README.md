# TypeScript + Yarn Workspace + Lerna + Hasura Monorepo Boilerplate

## Monorepo structure, workflow, and configuration

This monorepo structure is based on [jjangga0214/ts-yarn-lerna-boilerplate](https://github.com/jjangga0214/ts-yarn-lerna-boilerplate), except that Hasura and [`grqphql-yoga`](https://github.com/prisma-labs/graphql-yoga) is preconfigured.

## Hasura

Refer to [jjangga0214/hasura-starter#before-getting-started](https://github.com/jjangga0214/hasura-starter#before-getting-started) to set `.env`.

## Commands

```bash
# run Hasura and packages/api
yarn dev

# test packages/api, packages/hello
yarn test

# test packages/api, packages/hello, and measure coverage
yarn coverage

# open web browser and show coverage report
yarn coverage:show

# build packages/api, packages/hello
yarn build

# start Hasura and compiled packages/api
yarn start
```
