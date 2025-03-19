const { instance } = require("../config/razorpay");
const User = require("../models/User");
const Course = require("../models/Course");
const mongoose = require("mongoose");
const kafka = require("../config/kafka");
const redis = require("../config/redisClient");

// capture the payment and instantiate Razorpay order creation
exports.capturePayment = async (req, res) => {
  // fetch course id and user id
  const { course_id } = req.body;
  const userId = req.user.id;
  // validation
  if (!course_id) {
    return res.status(400).json({
      success: false,
      message: "Course ID is required.",
    });
  }
  // valid course details and also if user does not already have the same course
  let course;
  try {
    course = await redis.get(`course:${course_id}`);
    if (course) {
      course = JSON.parse(course);
    } else {
      course = await Course.findById(course_id);
      if (!course) {
        return res
          .status(404)
          .json({ success: false, message: "Course not found." });
      }
      await redis.setex(`course:${course_id}`, 3600, JSON.stringify(course));
    }

    const uid = mongoose.isValidObjectId(userId)
      ? userId
      : new mongoose.Types.ObjectId(userId);
    if (course.studentsEnrolled.includes(uid)) {
      return res.status(400).json({
        success: false,
        message: "You are already enrolled in this course.",
      });
    }
  } catch (error) {
    console.error("Error fetching course details:", error);
    return res.status(500).json({
      success: false,
      message:
        "An error occurred while validating course details. Please try again later.",
    });
  }
  // create order
  const amount = course.price;
  const currency = "INR";
  const options = {
    amount: amount * 100,
    currency,
    receipt: Math.random(Date.now()).toString(),
    notes: {
      courseId: course_id,
      userId,
    },
  };
  try {
    const paymentResponse = await instance.orders.create(options);
    console.log(paymentResponse);
    return res.status(200).json({
      success: true,
      courseName: course.courseName,
      courseDescription: course.courseDescription,
      thumbnail: course.thumbnail,
      orderId: paymentResponse.id,
      currency: paymentResponse.currency,
      amount: paymentResponse.amount,
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create payment order. Please try again later.",
    });
  }
};

// verify signature of razorpay and enroll student
// exports.verifySignature = async (req, res) => {
//     const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

//     const signature = req.headers["x-razorpay-signature"];

//     const shasum =  crypto.createHmac("sha256", webhookSecret);
//     shasum.update(JSON.stringify(req.body));
//     const digest = shasum.digest("hex");

//     if(signature === digest) {
//         console.log("Payment is Authorised");

//         const {courseId, userId} = req.body.payload.payment.entity.notes;

//         try{
//                 //find the course and enroll the student in it
//                 const enrolledCourse = await Course.findOneAndUpdate(
//                                                 {_id: courseId},
//                                                 {$push:{studentsEnrolled: userId}},
//                                                 {new:true},
//                 );

//                 if(!enrolledCourse) {
//                     return res.status(500).json({
//                         success:false,
//                         message:'Course not Found',
//                     });
//                 }

//                 console.log(enrolledCourse);

//                 //find the student and add the course to their list enrolled courses
//                 const enrolledStudent = await User.findOneAndUpdate(
//                                                 {_id:userId},
//                                                 {$push:{courses:courseId}},
//                                                 {new:true},
//                 );

//                 console.log(enrolledStudent);

//                 // mail send
//                 const emailResponse = await mailSender(
//                                         enrolledStudent.email,
//                                         "Congratulations from CodeHelp",
//                                         "Congratulations, you are onboarded into new CodeHelp Course",
//                 );

//                 console.log(emailResponse);
//                 return res.status(200).json({
//                     success:true,
//                     message:"Signature Verified and COurse Added",
//                 });

//         }
//         catch(error) {
//             console.log(error);
//             return res.status(500).json({
//                 success:false,
//                 message:error.message,
//             });
//         }
//     }
//     else {
//         return res.status(400).json({
//             success:false,
//             message:'Invalid request',
//         });
//     }
// };

async function enrollUserInCourse(courseId, userId) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Enroll User in Course
    const userEnrolled = await redis.sismember(
      `user:${userId}:courses`,
      courseId
    );
    if (userEnrolled) {
      console.log("User already enrolled");
      return { enrolledCourse: null, enrolledStudent: null };
    }

    const enrolledCourse = await Course.findByIdAndUpdate(
      courseId,
      { $addToSet: { studentsEnrolled: userId } },
      { new: true, session }
    );

    if (!enrolledCourse) throw new Error("Course not found.");

    // Add Course to User's Enrolled List
    const enrolledStudent = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { courses: courseId } },
      { new: true, session }
    );

    if (!enrolledStudent) throw new Error("User not found.");

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    await redis.sadd(`user:${userId}:courses`, courseId);
    await redis.expire(`user:${userId}:courses`, 3600);

    return { enrolledCourse, enrolledStudent };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}

async function sendEmailNotification(email, courseId) {
  const maxRetries = 3;
  let attempt = 0;
  let success = false;

  while (attempt < maxRetries && !success) {
    try {
      await producer.send({
        topic: "email-notifications",
        messages: [{ value: JSON.stringify({ email, courseId }) }],
      });

      console.log("Kafka message sent successfully");
      success = true;
    } catch (error) {
      attempt++;
      console.error(`Kafka send failed (Attempt ${attempt}):`, error);
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  if (!success) {
    console.error(
      "Kafka message failed after retries. Storing in Redis for retry."
    );
    await redis.lpush("failed-emails", JSON.stringify({ email, courseId }));
  }
}

exports.verifySignature = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    // Validate Razorpay Signature
    const shasum = crypto.createHmac("sha256", webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if (signature !== digest) {
      return res.status(400).json({
        success: false,
        message: "Invalid request. Signature verification failed.",
      });
    }

    // Extract courseId and userId
    const paymentId = req.body.payload.payment.entity.id;
    const isProcessed = await redis.sismember("processed-payments", paymentId);
    if (isProcessed) {
      return res
        .status(200)
        .json({ success: true, message: "Duplicate webhook ignored." });
    }

    const { courseId, userId } = req.body.payload.payment.entity.notes;

    const eventType = req.body.event;
    if (eventType === "payment.failed") {
      console.log(`Payment failed for User ${userId}, Course ${courseId}`);

      await redis.lpush(
        "failed-payments",
        JSON.stringify({ userId, courseId })
      );

      return res
        .status(200)
        .json({ success: false, message: "Payment failed." });
    }

    // Enroll User in Course
    if (eventType === "payment.authorized") {
      console.log("Payment authorized");
      const { enrolledStudent } = await enrollUserInCourse(courseId, userId);
      await redis.sadd("processed-payments", paymentId);
      await redis.expire("processed-payments", 86400);
      await sendEmailNotification(enrolledStudent.email, courseId);
      return res.status(200).json({
        success: true,
        message: "User enrolled successfully.",
      });
    }

    return res
      .status(400)
      .json({ success: false, message: "Unhandled event type." });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return res.status(500).json({
      success: false,
      message: "Error verifying payment.",
      error: error.message,
    });
  }
};
