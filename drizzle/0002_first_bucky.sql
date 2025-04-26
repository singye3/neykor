CREATE TABLE "siteSettings" (
	"id" serial PRIMARY KEY NOT NULL,
	"siteName" text DEFAULT 'Sacred Bhutan Travels' NOT NULL,
	"updatedAt" timestamp DEFAULT now()
);
