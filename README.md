# Starter

An empty Protobase app to build your own from: sign-in and accounts, the migration scripts, an empty
`config/` and an empty `db/migrations/`. Add a table in a migration and its config, and Protobase gives you its API and
its admin screens. New to Protobase? The [getting started](https://docs.protobase.net/getting-started/) guide and
[From a table to an admin](https://docs.protobase.net/guides/table-to-admin/) walk through it.

## Deploy on Protobase Cloud

[Start in the cloud from scratch](https://admin.protobase.net/start?preset=scratch): sign up with GitHub or email, choose where its code
goes (kept on Protobase, or a new private GitHub repository) and your workspace address. The app is created from this
repository; its first published change deploys it. Protobase Cloud is in early access, with
[plans](https://protobase.net/pricing) from €0.99 a month per app.

Already have a workspace? In the [console](https://admin.protobase.net), press **New app** and pick **From scratch** under
**Start from**. To deploy your own copy instead, made with **Use this template** below, pick
**An existing GitHub repository**: Protobase keeps the app in sync with it and deploys every push.

## Run it locally

You need [Bun](https://bun.sh) 1.4 and Docker.

```sh
bun install
bun run db:up                     # Postgres 18 in Docker on port 55432; creates .env from .env.example
bun run db:migrate
bun run protobase users create you@example.com --role admin --generate-password
bun run dev                       # http://localhost:5173
bun run test
```

Set your own `BETTER_AUTH_SECRET` in `.env` (`openssl rand -base64 32`). `bun run db:down` stops the database.

## Use it as a template

Press **Use this template** at the top of this page, then **Create a new repository**, to get your own copy with a
clean history. Clone it and run it as above:

```sh
git clone https://github.com/<you>/<your-repository>.git
cd <your-repository>
```

You can also fork it to contribute back, or start from it with `git clone https://github.com/protobase-community/starter.git`.

## Customise it

Your first table, a list of customers for example:

1. Write the migration `db/migrations/006_customers.sql`, numbered after the auth migrations, and run `bun run db:migrate`.
2. Run `bun run protobase scaffold <connection string> --ui` to write `config/customers/data.ts` and
   `config/customers/ui.ts` from the table, or write them yourself.
3. Export them from `config/index.ts`: `export * from './customers/data'` and `export * from './customers/ui'`.
4. `bun run dev` shows the new list and record page.

- **Tables and screens.** Each table's data config is in `config/<name>/data.ts` (fields, validation, who may read
  and change what) and its screens in `config/<name>/ui.ts` (lists, filters, record pages), all exported from
  `config/index.ts`. See the [data config](https://docs.protobase.net/reference/data-config/) and [UI config](https://docs.protobase.net/reference/ui-config/)
  references.
- **Database changes.** Add a migration in `db/migrations/`, numbered after the last one, and run
  `bun run db:migrate`. Never edit a migration that has run. For a new table, `bun run protobase scaffold
  <connection string> --ui` reads the database and writes its `data.ts` and `ui.ts`, which you then adjust.
- **Sign-in and accounts** are in `auth/`, on Better Auth ([Login](https://docs.protobase.net/reference/auth/)).
- **Coding agents.** [AGENTS.md](AGENTS.md) holds the rules an assistant follows when it changes the app.
- Check every change with `bun run typecheck`, `bun run test` and `bun run build`, as CI does.

## Built with Protobase

[Protobase](https://github.com/PrototeamHQ/protobase) builds the app from a Postgres database and a typed config: each table's data config sits in
`config/<name>/data.ts` and its screens in `config/<name>/ui.ts`, all exported from `config/index.ts`, and
`protobase dev` and `protobase serve` serve the API and the app from them.

- Tested with Protobase **0.45.19**: the `@protobase/*` packages are pinned to it in `package.json`, and CI runs
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
