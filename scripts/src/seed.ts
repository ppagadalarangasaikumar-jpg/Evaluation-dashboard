import { db, pool, depotsTable, vehicleTasksTable, notificationsTable } from "@workspace/db";

const depots = [
  { depotId: "depot-north", depotName: "North Regional Hub", mechanicHours: 40 },
  { depotId: "depot-south", depotName: "South Regional Hub", mechanicHours: 35 },
  { depotId: "depot-east",  depotName: "East Regional Hub",  mechanicHours: 50 },
  { depotId: "depot-west",  depotName: "West Regional Hub",  mechanicHours: 30 },
  { depotId: "depot-central", depotName: "Central Depot",    mechanicHours: 60 },
];

const vehicleTasks = [
  { taskId: "brake-inspection",    duration: 4,  impact: 9 },
  { taskId: "oil-change",          duration: 2,  impact: 6 },
  { taskId: "tire-rotation",       duration: 3,  impact: 7 },
  { taskId: "engine-diagnostic",   duration: 8,  impact: 10 },
  { taskId: "transmission-service",duration: 12, impact: 9 },
  { taskId: "battery-check",       duration: 1,  impact: 5 },
  { taskId: "coolant-flush",       duration: 3,  impact: 7 },
  { taskId: "air-filter-replace",  duration: 1,  impact: 4 },
  { taskId: "wiper-blade-replace", duration: 1,  impact: 3 },
  { taskId: "exhaust-inspection",  duration: 5,  impact: 8 },
  { taskId: "suspension-check",    duration: 6,  impact: 8 },
  { taskId: "ac-service",          duration: 4,  impact: 6 },
];

const now = new Date();
const daysAgo = (n: number) => new Date(now.getTime() - n * 86_400_000);

const notifications = [
  {
    studentId: 101,
    type: "Placement" as const,
    title: "Interview Scheduled: TechCorp",
    message: "Your interview with TechCorp has been scheduled for Monday at 10 AM. Please confirm your attendance.",
    isRead: false,
    createdAt: daysAgo(0),
  },
  {
    studentId: 102,
    type: "Result" as const,
    title: "Exam Results Released",
    message: "Your Data Structures & Algorithms exam results are now available. Log in to view your score.",
    isRead: false,
    createdAt: daysAgo(1),
  },
  {
    studentId: 103,
    type: "Event" as const,
    title: "Campus Hackathon 2026",
    message: "Registration is open for the annual 24-hour hackathon on July 15. Form your team and register by July 5.",
    isRead: true,
    createdAt: daysAgo(2),
  },
  {
    studentId: 104,
    type: "Placement" as const,
    title: "Offer Letter: InnovateCo",
    message: "Congratulations! InnovateCo has extended an offer letter. Please review and respond within 5 business days.",
    isRead: false,
    createdAt: daysAgo(0),
  },
  {
    studentId: 105,
    type: "Placement" as const,
    title: "Resume Shortlisted: DataSystems Inc.",
    message: "Your resume has been shortlisted by DataSystems Inc. for the Software Engineer role. An HR call will follow.",
    isRead: false,
    createdAt: daysAgo(3),
  },
  {
    studentId: 101,
    type: "Result" as const,
    title: "Project Grade Posted",
    message: "Your capstone project has been graded. You received an A. Feedback is available in the student portal.",
    isRead: true,
    createdAt: daysAgo(4),
  },
  {
    studentId: 106,
    type: "Event" as const,
    title: "Alumni Networking Night",
    message: "Join us on July 8 for an evening of networking with alumni from top tech companies. RSVP required.",
    isRead: false,
    createdAt: daysAgo(1),
  },
  {
    studentId: 107,
    type: "Placement" as const,
    title: "Walk-in Drive: CloudBase",
    message: "CloudBase is conducting a walk-in drive on campus this Friday for the role of Cloud Engineer. Bring your resume.",
    isRead: false,
    createdAt: daysAgo(2),
  },
  {
    studentId: 108,
    type: "Result" as const,
    title: "Supplementary Exam Notice",
    message: "You are eligible to appear for the supplementary exam for Operating Systems. Registration closes July 3.",
    isRead: false,
    createdAt: daysAgo(5),
  },
  {
    studentId: 109,
    type: "Event" as const,
    title: "Tech Talk: AI in Production",
    message: "Dr. Meera Rao will deliver a talk on deploying ML models at scale. July 12 at 3 PM in the Main Auditorium.",
    isRead: true,
    createdAt: daysAgo(6),
  },
];

async function seed() {
  console.log("🌱 Seeding database...\n");

  // Clear existing data
  console.log("  Clearing existing data...");
  await db.delete(notificationsTable);
  await db.delete(vehicleTasksTable);
  await db.delete(depotsTable);

  // Seed depots
  const insertedDepots = await db.insert(depotsTable).values(depots).returning();
  console.log(`  ✅ ${insertedDepots.length} depots inserted`);

  // Seed vehicle tasks
  const insertedTasks = await db.insert(vehicleTasksTable).values(vehicleTasks).returning();
  console.log(`  ✅ ${insertedTasks.length} vehicle tasks inserted`);

  // Seed notifications (insert with explicit createdAt)
  const insertedNotifications = await db
    .insert(notificationsTable)
    .values(notifications)
    .returning();
  console.log(`  ✅ ${insertedNotifications.length} notifications inserted`);

  console.log("\n🎉 Database seeded successfully!");
  console.log(`   Depots: ${insertedDepots.length}`);
  console.log(`   Vehicle tasks: ${insertedTasks.length}`);
  console.log(`   Notifications: ${insertedNotifications.length} (${notifications.filter(n => !n.isRead).length} unread)`);
}

seed()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(() => pool.end());
