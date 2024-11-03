# Gotham Messenger

Tech: tRPC, vite, tailwind, shadcn/ui, drizzle, postgres, redis, turborepo

## Installation

```bash
pnpm i
```

## Running the app

Run docker-compose to start redis and pg

```bash
docker-compose up -d
```

Push the db schema to postgres

```bash
pnpm db:push
```

Seed the db with users. Refer to the [schema](./apps/db/src/schema.ts) for the users and passwords.

```bash
pnpm db:seed
```

To start the app, run:

```bash
pnpm dev
```

## Testing

The dummy auth is sessionStorage based, open two tabs and sign in with Batman and Robin test the realtime messaging.
