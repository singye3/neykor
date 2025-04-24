CREATE TABLE "aboutPageContent" (
	"id" serial PRIMARY KEY NOT NULL,
	"mainHeading" text DEFAULT 'Our Sacred Journey' NOT NULL,
	"imageUrl" text DEFAULT '' NOT NULL,
	"imageAlt" text DEFAULT 'Bhutanese Guide' NOT NULL,
	"historyText" text DEFAULT '' NOT NULL,
	"missionText" text DEFAULT '' NOT NULL,
	"philosophyHeading" text DEFAULT 'Our Philosophy' NOT NULL,
	"philosophyQuote" text DEFAULT '' NOT NULL,
	"value1Title" text DEFAULT 'Authenticity' NOT NULL,
	"value1Text" text DEFAULT '' NOT NULL,
	"value2Title" text DEFAULT 'Respect' NOT NULL,
	"value2Text" text DEFAULT '' NOT NULL,
	"value3Title" text DEFAULT 'Knowledge' NOT NULL,
	"value3Text" text DEFAULT '' NOT NULL,
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contactMessages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"handled" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "galleryImages" (
	"id" serial PRIMARY KEY NOT NULL,
	"caption" text NOT NULL,
	"type" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inquiries" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"message" text NOT NULL,
	"tourId" integer NOT NULL,
	"tourName" text NOT NULL,
	"handled" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "newsletterSubscribers" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	CONSTRAINT "newsletterSubscribers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "testimonials" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"location" text NOT NULL,
	"content" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tours" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"longDescription" text NOT NULL,
	"duration" text NOT NULL,
	"difficulty" text NOT NULL,
	"accommodation" text NOT NULL,
	"groupSize" text NOT NULL,
	"price" integer NOT NULL,
	"imageType" text,
	"itinerary" json NOT NULL,
	"featured" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
