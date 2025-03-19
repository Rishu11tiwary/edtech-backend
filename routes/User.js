const express = require("express");
const router = express.Router();

const {
  login,
  signup,
  sendotp,
  changePassword,
} = require("../controllers/Auth");

const {
  resetPasswordToken,
  resetPassword,
} = require("../controllers/ResetPassword");

const { auth } = require("../middlewares/auth");

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags:
 *       - Auth
 *     description: Logs in a user and returns a JWT token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "P@ssw0rd!"
 *     responses:
 *       200:
 *         description: Login successful
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
 *                   example: "Login successful."
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       example: "65f98c56ab12d34ef1234567"
 *                     firstName:
 *                       type: string
 *                       example: "John"
 *                     lastName:
 *                       type: string
 *                       example: "Doe"
 *                     email:
 *                       type: string
 *                       example: "john.doe@example.com"
 *                     accountType:
 *                       type: string
 *                       example: "student"
 *                     token:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Missing email or password
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
 *                   example: "MISSING_FIELDS"
 *                 message:
 *                   type: string
 *                   example: "Email and password are required."
 *       401:
 *         description: Unauthorized - Incorrect credentials
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
 *                   example: "User not registered. Please sign up first."
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
 *                   example: "An error occurred while logging in. Please try again later."
 *                 errorDetails:
 *                   type: string
 *                   example: "Database connection failed"
 */
router.post("/login", login);

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: User signup
 *     tags:
 *       - Auth
 *     description: Registers a new user with OTP verification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *               - confirmPassword
 *               - accountType
 *               - otp
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 example: "Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "Password123!"
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 example: "Password123!"
 *               accountType:
 *                 type: string
 *                 enum: [student, instructor, admin]
 *                 example: "student"
 *               contactNumber:
 *                 type: string
 *                 example: "+1234567890"
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       201:
 *         description: User signed up successfully
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
 *                   example: "User signed up successfully!"
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       example: "605c72b9a3b1c23f44d9f9b5"
 *                     firstName:
 *                       type: string
 *                       example: "John"
 *                     lastName:
 *                       type: string
 *                       example: "Doe"
 *                     email:
 *                       type: string
 *                       example: "john.doe@example.com"
 *                     accountType:
 *                       type: string
 *                       example: "student"
 *       400:
 *         description: Bad request, missing fields or validation errors
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
 *                 message:
 *                   type: string
 *               examples:
 *                 MissingFields:
 *                   value:
 *                     success: false
 *                     errorCode: "MISSING_FIELDS"
 *                     message: "All mandatory fields are required."
 *                 PasswordMismatch:
 *                   value:
 *                     success: false
 *                     errorCode: "PASSWORD_MISMATCH"
 *                     message: "Password and confirmPassword do not match."
 *                 UserExists:
 *                   value:
 *                     success: false
 *                     errorCode: "USER_ALREADY_REGISTERED"
 *                     message: "User is already registered with this email."
 *                 OTPNotFound:
 *                   value:
 *                     success: false
 *                     errorCode: "OTP_NOT_FOUND"
 *                     message: "OTP not found. Please request a new one."
 *                 InvalidOTP:
 *                   value:
 *                     success: false
 *                     errorCode: "INVALID_OTP"
 *                     message: "Invalid OTP. Please try again."
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
 *                   example: "User registration failed. Please try again later."
 *                 errorDetails:
 *                   type: string
 *                   example: "Database connection failed"
 */
router.post("/signup", signup);

/**
 * @swagger
 * /auth/sendotp:
 *   post:
 *     summary: Send OTP for user registration
 *     tags:
 *       - Auth
 *     description: Generates and sends a 6-digit OTP to the user's email for verification before signup.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *     responses:
 *       200:
 *         description: OTP sent successfully
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
 *                   example: "OTP has been sent successfully."
 *                 data:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                       example: "john.doe@example.com"
 *                     otp:
 *                       type: string
 *                       example: "123456"
 *       400:
 *         description: Bad request, email missing or user already registered
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
 *                 message:
 *                   type: string
 *               examples:
 *                 MissingEmail:
 *                   value:
 *                     success: false
 *                     errorCode: "MISSING_FIELDS"
 *                     message: "Please provide an email"
 *                 UserExists:
 *                   value:
 *                     success: false
 *                     errorCode: "USER_ALREADY_REGISTERED"
 *                     message: "User is already registered with this email."
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
 *                   example: "Failed to send OTP. Please try again later."
 *                 errorDetails:
 *                   type: string
 *                   example: "Database connection failed"
 */
router.post("/sendotp", sendotp);

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Change user password
 *     tags:
 *       - Auth
 *     description: Allows an authenticated user to change their password.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 format: password
 *                 example: "OldPassword123"
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: "NewPassword456"
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 example: "NewPassword456"
 *     responses:
 *       200:
 *         description: Password changed successfully
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
 *                   example: "Password changed successfully. Please log in with your new password."
 *       400:
 *         description: Bad request (missing fields, password mismatch, etc.)
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
 *                   example: "MISSING_FIELDS"
 *                 message:
 *                   type: string
 *                   example: "Old password, new password, and confirm password are required."
 *       401:
 *         description: Unauthorized - Incorrect old password
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
 *                   example: "INVALID_OLD_PASSWORD"
 *                 message:
 *                   type: string
 *                   example: "Old password is incorrect."
 *       404:
 *         description: User not found
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
 *                   example: "User not found. Please log in again."
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
 *                   example: "An error occurred while updating the password. Please try again later."
 *                 errorDetails:
 *                   type: string
 *                   example: "Database connection failed"
 */
router.post("/changepassword", auth, changePassword);

/**
 * @swagger
 * /auth/reset-password-token:
 *   post:
 *     summary: Generate password reset token
 *     tags:
 *       - Auth
 *     description: Generates a password reset token and sends an email with the reset link.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *     responses:
 *       200:
 *         description: Password reset link sent successfully
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
 *                   example: "Email sent successfully, please check mail and reset password"
 *       404:
 *         description: Email not found in the system
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
 *                   example: "Your email is not registered with us"
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
 *                   example: "Something went wrong while sending password reset mail"
 */
router.post("/reset-password-token", resetPasswordToken);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password using token
 *     tags:
 *       - Auth
 *     description: Allows users to reset their password using a valid reset token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *               - confirmPassword
 *               - token
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "newSecureP@ssword"
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 example: "newSecureP@ssword"
 *               token:
 *                 type: string
 *                 example: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
 *     responses:
 *       200:
 *         description: Password reset successful
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
 *                   example: "Password reset successful"
 *       400:
 *         description: Password and confirm password do not match
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
 *                   example: "Password and confirm password do not match"
 *       404:
 *         description: Invalid or expired token
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
 *                   example: "Token is invalid"
 *       410:
 *         description: Expired token
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
 *                   example: "Token has expired"
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
 *                   example: "Something went wrong while resetting password"
 */
router.post("/reset-password", resetPassword);

module.exports = router;