import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { getEnv } from "@/config/env";
import { db } from "./index";
import { users } from "./schema";

async function main() {
  const env = getEnv();
  const email = env.ADMIN_EMAIL.toLowerCase();

  const existing = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existing) {
    let changed = false;
    if (existing.role !== "admin") {
      await db.update(users).set({ role: "admin" }).where(eq(users.id, existing.id));
      console.log(`Promoted ${email} to admin.`);
      changed = true;
    }
    if (!existing.name) {
      await db.update(users).set({ name: "Administrator" }).where(eq(users.id, existing.id));
      console.log(`Set admin name to "Administrator".`);
      changed = true;
    }
    if (!changed) {
      console.log(`Admin ${email} already exists. Skipping.`);
    }
    return;
  }

  const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 10);
  await db.insert(users).values({
    email,
    name: "Administrator",
    passwordHash,
    role: "admin",
    assignedClassId: null,
  });
  console.log(`Created admin account: ${email}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
