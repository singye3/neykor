// scripts/create-admin-user.ts
import 'dotenv/config';
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { db } from "../server/db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function createAdminUser() {
  try {
    // Check if admin user already exists
    const existingAdmin = await db.select().from(users).where(eq(users.username, "admin"));
    
    if (existingAdmin.length > 0) {
      console.log("Admin user already exists");
      return;
    }
    
    // Hash the password
    const hashedPassword = await hashPassword("admin123");
    
    // Create the admin user
    const [adminUser] = await db.insert(users).values({
      username: "admin",
      password: hashedPassword
    }).returning();
    
    console.log("Admin user created successfully:", adminUser);
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
}

createAdminUser().then(() => process.exit());