# Starter

An empty Protobase app to build your own from: sign-in and accounts, the migration scripts, an empty `config/` and an
empty `db/migrations/`. Add a table in a migration and its config, and Protobase gives you its API and its screens.

## Use this template

Press **Use this template** at the top of this page, then **Create a new repository**, to get your own copy with a
clean history. Clone it and follow the setup below:

```sh
git clone https://github.com/<you>/<your-repository>.git
cd <your-repository>
```

## Setup

You need [Bun](https://bun.sh) 1.4 and Docker.

```sh
bun install
bun run db:up                     # Postgres 18 in Docker on port 55432; creates .env from .env.example
bun run db:migrate
bun run protobase users create you@example.com --role admin --generate-password
bun run dev                       # http://localhost:5173
bun run test
```

Set your own `BETTER_AUTH_SECRET` in `.env` (`openssl rand -base64 32`). Then add your first table: a migration in
`db/migrations/` (`001_customers.sql`), its config in `config/customers/data.ts` and `config/customers/ui.ts`, exported
from `config/index.ts`. The [docs](https://docs.protobase.net) walk through it, and [AGENTS.md](AGENTS.md) has the rules for changing it.

## Built with Protobase

[Protobase](https://github.com/PrototeamHQ/protobase) builds the app from a Postgres database and a typed config: each table's data config sits in
`config/<name>/data.ts` and its screens in `config/<name>/ui.ts`, all exported from `config/index.ts`, and
`protobase dev` and `protobase serve` serve the API and the app from them.

- Tested with Protobase **0.45.9**: the `@protobase/*` packages are pinned to it in `package.json`, and CI runs
  against it. To upgrade, set the new version on each `@protobase/*` package, run `bun install`, then
  `bun run typecheck`, `bun run test` and `bun run build`. The [release notes](https://github.com/PrototeamHQ/protobase/releases) say what changed.
- Docs: [docs.protobase.net](https://docs.protobase.net). Source and issues: [PrototeamHQ/protobase](https://github.com/PrototeamHQ/protobase).
- This app started as an example in Protobase's repository; its history came with it.
- The same app is the `scratch` preset that new Protobase apps can start from ([`@protobase/presets`](https://github.com/PrototeamHQ/protobase/tree/main/packages/presets)).

## Notes

It has no resources, so `protobase doctor` refuses it until the first change adds one.

## Contributing

Contributions are welcome, from a typo to a new screen: see [CONTRIBUTING.md](CONTRIBUTING.md). A problem in Protobase
itself goes to [Protobase's issues](https://github.com/PrototeamHQ/protobase/issues).

## Licence

[Apache License 2.0](LICENSE).
