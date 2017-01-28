# vue-curated-server

A GraphQL server for [curated vue packages](https://github.com/Akryum/vue-curated), powered by Apollo.

Set the `GITHUB_TOKEN` env var with a GitHub OAuth token.
Set the `DB_PATH` env var with a path to the database folder with write access.

```
npm install
npm start
```

By defaul, the graphql endpoint is `http://localhost:3000` and GraphiQL is available at `http://localhost:3000/graphiql`.
