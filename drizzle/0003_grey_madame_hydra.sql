CREATE TABLE "contactPageSettings" (
	"id" serial PRIMARY KEY NOT NULL,
	"pageHeading" text DEFAULT 'Begin Your Journey' NOT NULL,
	"locationHeading" text DEFAULT 'Our Location' NOT NULL,
	"locationImageURL" text DEFAULT '' NOT NULL,
	"locationImageAlt" text DEFAULT 'Mountains of Bhutan' NOT NULL,
	"locationImageCaption" text DEFAULT 'Our sanctuary in the heart of Thimphu...' NOT NULL,
	"address" text DEFAULT 'Near Memorial Chorten, Thimphu, Kingdom of Bhutan' NOT NULL,
	"email" text DEFAULT 'pilgrimages@sacredbhutantravels.bt' NOT NULL,
	"phone" text DEFAULT '+975 2 333 444' NOT NULL,
	"officeHoursHeading" text DEFAULT 'Office Hours' NOT NULL,
	"officeHoursText" text DEFAULT 'Monday to Friday: 9:00 AM - 5:00 PM (Bhutan Standard Time)' NOT NULL,
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "galleryPageSettings" (
	"id" serial PRIMARY KEY NOT NULL,
	"pageHeading" text DEFAULT 'Sacred Visions' NOT NULL,
	"pageParagraph" text DEFAULT 'Explore our visual chronicle...' NOT NULL,
	"updatedAt" timestamp DEFAULT now()
);
