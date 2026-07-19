# IAI Muda Wilayah DKI Jakarta

Website resmi IAI Muda Wilayah DKI Jakarta — Next.js + Drizzle ORM + TiDB MySQL.

## Run Locally

1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env` and adjust values.
3. Run database seed:
   `npm run seed`
4. Start development server:
   `npm run dev`

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run seed` | Seed database |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:push` | Push Drizzle schema to database |
