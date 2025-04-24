// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';
import 'dotenv/config';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

export default defineConfig({
  dialect: 'postgresql', // Specify the dialect here!
  schema: './shared/schema.ts', // Path to your schema file
  out: './drizzle', // Output directory for migrations (or your chosen folder)
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  verbose: true, // Optional: for more detailed output
  strict: true, // Optional: for stricter checks
});