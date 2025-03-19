const express = require("express")
const router = express.Router()

const { capturePayment, verifySignature } = require("../controllers/Payments")
const { auth, isInstructor, isStudent, isAdmin } = require("../middlewares/auth")

/**
 * @swagger
 * /payment/capturePayment:
 *   post:
 *     summary: Capture payment and create a Razorpay order
 *     tags:
 *       - Payments
 *     description: Captures the payment and creates an order for a course.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - course_id
 *             properties:
 *               course_id:
 *                 type: string
 *                 description: The ID of the course to be purchased.
 *     responses:
 *       200:
 *         description: Payment order created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 courseName:
 *                   type: string
 *                   example: "Full Stack Web Development"
 *                 courseDescription:
 *                   type: string
 *                   example: "A comprehensive course on full-stack web development."
 *                 thumbnail:
 *                   type: string
 *                   format: uri
 *                   example: "https://example.com/course-thumbnail.jpg"
 *                 orderId:
 *                   type: string
 *                   example: "order_9A33XWu170gUtm"
 *                 currency:
 *                   type: string
 *                   example: "INR"
 *                 amount:
 *                   type: integer
 *                   example: 49999
 *       400:
 *         description: Bad request due to missing or invalid parameters.
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
 *                   example: "Course ID is required."
 *       404:
 *         description: Course not found.
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
 *                   example: "Course not found."
 *       500:
 *         description: Internal server error while creating the payment order.
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
 *                   example: "Failed to create payment order. Please try again later."
 */
router.post("/capturePayment", auth, isStudent, capturePayment)
router.post("/verifySignature", verifySignature)

module.exports = router;