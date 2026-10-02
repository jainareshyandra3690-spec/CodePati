import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.log("\n=======================================================");
    console.log("  CodePati Admin Management CLI");
    console.log("=======================================================\n");
    console.log("Usage: npm run promote-admin <user-email>\n");
    console.log("Listing current users in database:\n");

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    if (users.length === 0) {
      console.log("No users currently registered in the database.");
      console.log("Tip: Sign in first at http://localhost:3000/login to create an account.\n");
    } else {
      console.table(users);
    }
    return;
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.error(`\n❌ User with email "${email}" was not found in the database.`);
    console.log("Make sure the user has signed in at least once so their account exists.\n");
    process.exit(1);
  }

  if (user.role === "ADMIN") {
    console.log(`\nℹ️ User "${email}" is already an ADMIN.\n`);
    return;
  }

  const updated = await prisma.user.update({
    where: { email },
    data: { role: "ADMIN" },
  });

  console.log("\n=======================================================");
  console.log(`✅ SUCCESS: Promoted ${updated.name || updated.email} to ADMIN`);
  console.log(`   Email: ${updated.email}`);
  console.log(`   Role:  ${updated.role}`);
  console.log("=======================================================\n");
}

main()
  .catch((e) => {
    console.error("Failed to promote user:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
