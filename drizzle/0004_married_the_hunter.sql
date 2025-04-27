ALTER TABLE "tours" ADD COLUMN "location" text NOT NULL;--> statement-breakpoint
CREATE INDEX "location_idx" ON "tours" USING btree ("location");