const cron = require("node-cron");
const User = require("./models/User");
const deleteProfile = require("./controllers/userController").deleteProfile;
const redis = require("./config/redisClient");

//runs every 24 hours
cron.schedule("0 0 * * *", async () => {
  try {
    console.log("Checking for users scheduled for deletion...");

    const now = new Date();
    const usersToDelete = await User.find({
      scheduledForDeletion: { $lte: now },
    });

    for (const user of usersToDelete) {
      await deleteProfile(user._id);
    }

    console.log("Scheduled account deletions completed.");
  } catch (error) {
    console.error("Error running scheduled deletions:", error);
  }
});



async function processFailedEmails() {
  console.log("Running failed email retry process...");

  while (true) {
    const failedEmail = await redis.rpop("failed-emails");
    if (!failedEmail) break;

    const { email, courseId } = JSON.parse(failedEmail);

    try {
      await producer.send({
        topic: "email-notifications",
        messages: [{ value: JSON.stringify({ email, courseId }) }],
      });

      console.log("Retried Kafka message sent successfully:", email);
    } catch (error) {
      console.error("Retry failed. Re-adding to Redis queue:", email);
      await redis.lpush("failed-emails", JSON.stringify({ email, courseId }));
    }
  }
}

// Run 5 mins
cron.schedule("*/5 * * * *", processFailedEmails);
