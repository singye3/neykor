ALTER TABLE "contactMessages" ALTER COLUMN "createdAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "contactMessages" ADD COLUMN "phone" text;