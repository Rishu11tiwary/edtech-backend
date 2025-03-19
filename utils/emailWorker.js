// const { Kafka } = require("kafkajs");
// const mailSender = require("./mailSender");
// const { courseEnrollmentEmail } = require("../mail/courseEnrollmentEmail");

// const run = async () => {
//     await consumer.subscribe({ topic: "email-notifications", fromBeginning: false });

//     await consumer.run({
//         eachMessage: async ({ message }) => {
//             const { email, courseId } = JSON.parse(message.value.toString());
//             try {
//                 await mailSender(email, "Course Enrollment", courseEnrollmentEmail(courseId));
//                 console.log(`Email sent to ${email}`);
//             } catch (err) {
//                 console.error(`Failed to send email: ${err.message}`);
//             }
//         },
//     });
// };

// run().catch(console.error);

const { consumer } = require("../config/kafka");
const mailSender = require("./mailSender");
const { courseEnrollmentEmail } = require("../mail/courseEnrollmentEmail");

const runConsumer = async () => {
  try {
    console.log("🔄 Starting Kafka Consumer...");
    await consumer.run({
      eachMessage: async ({ message }) => {
        const { email, courseId } = JSON.parse(message.value.toString());
        try {
          await mailSender(
            email,
            "Course Enrollment",
            courseEnrollmentEmail(courseId)
          );
          console.log(`📧 Email sent to ${email}`);
        } catch (err) {
          console.error(`❌ Failed to send email: ${err.message}`);
        }
      },
    });
  } catch (error) {
    console.error("❌ Error running Kafka consumer:", error);
  }
};

runConsumer();
