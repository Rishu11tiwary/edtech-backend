const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/auth");
const {
  scheduleAccountDeletion,
  updateProfile,
  getAllUserDetails,
  updateDisplayPicture,
  getEnrolledCourses,
} = require("../controllers/Profile");

//Profile routes
/**
 * @swagger
 * /profile/schedule-delete:
 *   delete:
 *     summary: Schedule account deletion
 *     tags:
 *       - Profile
 *     description: Schedules the user’s account for deletion in 5 days.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Account deletion successfully scheduled
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Account deletion scheduled in 5 days."
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Unauthorized. Please log in."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Failed to schedule account deletion."
 */
router.delete("/deleteProfile", auth, scheduleAccountDeletion);

/**
 * @swagger
 * /profile/updateProfile:
 *   put:
 *     summary: Update user profile
 *     tags:
 *       - Profile
 *     description: Updates the profile details of an authenticated user.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 example: "1995-06-15"
 *               gender:
 *                 type: string
 *                 enum: ["Male", "Female", "Other"]
 *                 example: "Male"
 *               about:
 *                 type: string
 *                 example: "Software Engineer with 5 years of experience."
 *               contactNumber:
 *                 type: string
 *                 pattern: "^[0-9]{10}$"
 *                 example: "9876543210"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Profile updated successfully!"
 *                 data:
 *                   type: object
 *                   properties:
 *                     dateOfBirth:
 *                       type: string
 *                       format: date
 *                       example: "1995-06-15"
 *                     gender:
 *                       type: string
 *                       example: "Male"
 *                     about:
 *                       type: string
 *                       example: "Software Engineer with 5 years of experience."
 *                     contactNumber:
 *                       type: string
 *                       example: "9876543210"
 *       400:
 *         description: Validation error (missing required fields)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 errorCode:
 *                   type: string
 *                   example: "VALIDATION_ERROR"
 *                 message:
 *                   type: string
 *                   example: "Required fields are missing. Please provide contactNumber, gender, and userId."
 *       404:
 *         description: User or Profile not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 errorCode:
 *                   type: string
 *                   example: "USER_NOT_FOUND"
 *                 message:
 *                   type: string
 *                   example: "User not found. Please check the userId and try again."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 errorCode:
 *                   type: string
 *                   example: "INTERNAL_SERVER_ERROR"
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error: Unable to update profile. Please try again later."
 */
router.put("/updateProfile", auth, updateProfile);

/**
 * @swagger
 * /profile/getUserDetails:
 *   get:
 *     summary: Get all user details
 *     tags:
 *       - Profile
 *     description: Retrieves the details of the authenticated user, including additional profile information.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User Data fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "65b8f9a0c0a3a12345d67890"
 *                     email:
 *                       type: string
 *                       example: "user@example.com"
 *                     firstName:
 *                       type: string
 *                       example: "John"
 *                     lastName:
 *                       type: string
 *                       example: "Doe"
 *                     additionalDetails:
 *                       type: object
 *                       properties:
 *                         dateOfBirth:
 *                           type: string
 *                           format: date
 *                           example: "1995-06-15"
 *                         gender:
 *                           type: string
 *                           example: "Male"
 *                         about:
 *                           type: string
 *                           example: "Software Engineer"
 *                         contactNumber:
 *                           type: string
 *                           example: "9876543210"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error. Please try again later."
 */
router.get("/getUserDetails", auth, getAllUserDetails);

/**
 * @swagger
 * /profile/getEnrolledCourses:
 *   get:
 *     summary: Get enrolled courses of the authenticated user
 *     tags:
 *       - Profile
 *     description: Retrieves the list of courses that the authenticated user is enrolled in.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved enrolled courses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "65b8f9a0c0a3a12345d67890"
 *                       title:
 *                         type: string
 *                         example: "JavaScript for Beginners"
 *                       description:
 *                         type: string
 *                         example: "An introductory course on JavaScript fundamentals."
 *                       instructor:
 *                         type: string
 *                         example: "John Doe"
 *                       duration:
 *                         type: string
 *                         example: "6 weeks"
 *       400:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Could not find user with id: 65b8f9a0c0a3a12345d67890"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error. Please try again later."
 */
router.get("/getEnrolledCourses", auth, getEnrolledCourses);

/**
 * @swagger
 * /profile/updateDisplayPicture:
 *   put:
 *     summary: Update user's profile picture
 *     tags:
 *       - Profile
 *     description: Uploads a new profile picture for the authenticated user. Only JPEG and PNG formats are allowed, with a maximum size of 2MB.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               displayPicture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile picture updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Image Updated successfully"
 *                 updatedProfile:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "65b8f9a0c0a3a12345d67890"
 *                     image:
 *                       type: string
 *                       example: "https://res.cloudinary.com/example/image/upload/v1679000000/profile.jpg"
 *       400:
 *         description: Bad request (missing file, invalid format, or file too large)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid file format. Only JPEG and PNG allowed"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error. Please try again later."
 */
router.put("/updateDisplayPicture", auth, updateDisplayPicture);

module.exports = router;
