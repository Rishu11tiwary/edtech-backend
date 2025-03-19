const express = require("express");
const router = express.Router();

const {
  createCourse,
  getAllCourses,
  getCourseDetails,
} = require("../controllers/Course");

const {
  showAllCategories,
  createCategory,
  categoryPageDetails,
} = require("../controllers/Category");

const {
  createSection,
  updateSection,
  deleteSection,
} = require("../controllers/Section");

const {
  createSubSection,
  updateSubSection,
  deleteSubSection,
} = require("../controllers/Subsection");

const {
  createRating,
  getAverageRating,
  getAllRating,
} = require("../controllers/RatingAndReview");

const {
  auth,
  isInstructor,
  isStudent,
  isAdmin,
} = require("../middlewares/auth");

/**
 * @swagger
 * /course/createCourse:
 *   post:
 *     summary: Create a new course
 *     tags:
 *       - Course
 *     description: Allows an authenticated instructor to create a new course. The request must include course details and a thumbnail image.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               courseName:
 *                 type: string
 *                 example: "Full Stack Web Development"
 *               courseDescription:
 *                 type: string
 *                 example: "Learn full-stack web development using React and Node.js."
 *               whatWillYouLearn:
 *                 type: string
 *                 example: "Frontend and Backend development, Database management, Deployment."
 *               price:
 *                 type: number
 *                 example: 499
 *               category:
 *                 type: string
 *                 example: "65b8f9a0c0a3a12345d67890"
 *               tag:
 *                 type: string
 *                 example: "Web Development"
 *               thumbnailImage:
 *                 type: string
 *                 format: binary
 *                 description: The course thumbnail image (JPEG/PNG).
 *     responses:
 *       201:
 *         description: Course created successfully
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
 *                   example: "Course created successfully!"
 *                 newCourse:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "65b8f9a0c0a3a12345d67891"
 *                     courseName:
 *                       type: string
 *                       example: "Full Stack Web Development"
 *                     price:
 *                       type: number
 *                       example: 499
 *                     instructor:
 *                       type: string
 *                       example: "65b8f9a0c0a3a12345d67892"
 *                     category:
 *                       type: string
 *                       example: "65b8f9a0c0a3a12345d67890"
 *                     thumbnail:
 *                       type: string
 *                       example: "https://res.cloudinary.com/example/image/upload/v1679000000/course.jpg"
 *       400:
 *         description: Bad request (missing required fields)
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
 *                   example: "Mandatory fields missing"
 *       404:
 *         description: Instructor or category not found
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
 *                   example: "Instructor not found."
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
 *                   example: "Error while creating course"
 */
router.post("/createCourse", auth, isInstructor, createCourse);

/**
 * @swagger
 * /course/addSection:
 *   post:
 *     summary: Create a new section within a course
 *     tags:
 *       - Section
 *     description: Allows an authenticated user to create a new section in an existing course.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sectionName:
 *                 type: string
 *                 example: "Introduction to JavaScript"
 *               courseId:
 *                 type: string
 *                 example: "65b8f9a0c0a3a12345d67890"
 *     responses:
 *       200:
 *         description: Section created successfully
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
 *                   example: "Section created successfully!"
 *                 updatedCourseDetails:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "65b8f9a0c0a3a12345d67890"
 *                     courseContent:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "65b8f9a0c0a3a12345d67891"
 *                           sectionName:
 *                             type: string
 *                             example: "Introduction to JavaScript"
 *                           subSection:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 _id:
 *                                   type: string
 *                                   example: "65b8f9a0c0a3a12345d67892"
 *                                 subSectionName:
 *                                   type: string
 *                                   example: "Variables and Data Types"
 *       400:
 *         description: Bad request (missing required fields)
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
 *                   example: "Missing mandatory fields"
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
 *                   example: "Error while section creation"
 */
router.post("/addSection", auth, isInstructor, createSection);

/**
 * @swagger
 * /course/updateSection:
 *   put:
 *     summary: Update an existing section
 *     tags:
 *       - Section
 *     description: Allows an authenticated user to update the name of an existing section.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sectionId:
 *                 type: string
 *                 example: "65b8f9a0c0a3a12345d67891"
 *               sectionName:
 *                 type: string
 *                 example: "Updated Introduction to JavaScript"
 *     responses:
 *       200:
 *         description: Section updated successfully
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
 *                   example: "Section updated Successfully!"
 *       400:
 *         description: Bad request (missing required fields)
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
 *                   example: "Missing mandatory fields"
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
 *                   example: "Error while updating section"
 *                 error:
 *                   type: string
 *                   example: "MongoDB error message here"
 */
router.put("/updateSection", auth, isInstructor, updateSection);

/**
 * @swagger
 * /course/deleteSection/{sectionId}:
 *   delete:
 *     summary: Delete a section
 *     tags:
 *       - Section
 *     description: Deletes an existing section based on the provided section ID.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sectionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the section to delete.
 *         example: "65b8f9a0c0a3a12345d67891"
 *     responses:
 *       200:
 *         description: Section deleted successfully
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
 *                   example: "Section deleted successfully!"
 *       400:
 *         description: Bad request (missing or invalid section ID)
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
 *                   example: "Invalid section ID"
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
 *                   example: "Error while deleting section"
 *                 error:
 *                   type: string
 *                   example: "MongoDB error message here"
 */
router.delete("/deleteSection/:sectionId", auth, isInstructor, deleteSection);

/**
 * @swagger
 * /course/subSection:
 *   put:
 *     summary: Update an existing subsection
 *     tags:
 *       - SubSection
 *     description: Updates an existing subsection with the provided details. Supports optional video file upload.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               subSectionId:
 *                 type: string
 *                 description: ID of the subsection to update
 *                 example: "65b8fa12c0a3a12345d67891"
 *               title:
 *                 type: string
 *                 description: Title of the subsection
 *                 example: "Introduction to React"
 *               timeDuration:
 *                 type: string
 *                 description: Duration of the subsection video
 *                 example: "5:30"
 *               description:
 *                 type: string
 *                 description: Description of the subsection
 *                 example: "This subsection covers the basics of React components."
 *               vedioFile:
 *                 type: string
 *                 format: binary
 *                 description: Video file to upload (optional)
 *     responses:
 *       200:
 *         description: SubSection updated successfully
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
 *                   example: "SubSection updated successfully"
 *                 updatedSubSection:
 *                   type: object
 *                   example:
 *                     _id: "65b8fa12c0a3a12345d67891"
 *                     title: "Introduction to React"
 *                     timeDuration: "5:30"
 *                     description: "This subsection covers the basics of React components."
 *                     vedioUrl: "https://cloudinary.com/video.mp4"
 *       400:
 *         description: Bad request (missing or invalid fields)
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
 *                   example: "Missing mandatory fields"
 *       404:
 *         description: SubSection not found
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
 *                   example: "SubSection not found"
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
 *                   example: "Error while updating SubSection"
 *                 error:
 *                   type: string
 *                   example: "MongoDB error message here"
 */
router.put("/updateSubSection", auth, isInstructor, updateSubSection);

/**
 * @swagger
 * /course/subSection/delete:
 *   delete:
 *     summary: Delete a subsection
 *     tags:
 *       - SubSection
 *     description: Deletes an existing subsection based on the provided subsection ID and section ID.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subSectionId
 *               - sectionId
 *             properties:
 *               subSectionId:
 *                 type: string
 *                 description: The ID of the subsection to delete.
 *                 example: "65c9e8d0b1a2c34567d89012"
 *               sectionId:
 *                 type: string
 *                 description: The ID of the section containing this subsection.
 *                 example: "65b8f9a0c0a3a12345d67891"
 *     responses:
 *       200:
 *         description: SubSection deleted successfully
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
 *                   example: "SubSection deleted successfully!"
 *       400:
 *         description: Bad request (missing or invalid subsection/section ID)
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
 *                   example: "Invalid subsection or section ID"
 *       404:
 *         description: SubSection not found
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
 *                   example: "SubSection not found"
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
 *                   example: "Error while deleting SubSection"
 *                 error:
 *                   type: string
 *                   example: "MongoDB error message here"
 */
router.delete("/deleteSubSection", auth, isInstructor, deleteSubSection);

/**
 * @swagger
 * /course/subSection/add:
 *   post:
 *     summary: Create a new subsection
 *     tags:
 *       - SubSection
 *     description: Adds a new subsection under a specified section, including title, time duration, description, and a video file.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - sectionId
 *               - title
 *               - timeDuration
 *               - description
 *               - vedioFile
 *             properties:
 *               sectionId:
 *                 type: string
 *                 description: The ID of the section to which this subsection belongs.
 *                 example: "65b8f9a0c0a3a12345d67891"
 *               title:
 *                 type: string
 *                 description: The title of the subsection.
 *                 example: "Introduction to React"
 *               timeDuration:
 *                 type: string
 *                 description: The duration of the subsection video (e.g., "5m 30s").
 *                 example: "5:30"
 *               description:
 *                 type: string
 *                 description: A short description of the subsection.
 *                 example: "This is an introduction to React fundamentals."
 *               vedioFile:
 *                 type: string
 *                 format: binary
 *                 description: The video file to be uploaded.
 *     responses:
 *       201:
 *         description: SubSection created successfully
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
 *                   example: "SubSection created successfully."
 *                 updatedSectionDetails:
 *                   type: object
 *                   description: The updated section details including the new subsection.
 *       400:
 *         description: Bad request (missing required fields)
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
 *                   example: "All fields (sectionId, title, timeDuration, description) are required."
 *       404:
 *         description: Section not found
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
 *                   example: "Section not found. Please provide a valid sectionId."
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
 *                   example: "Internal server error. Unable to create SubSection."
 *                 error:
 *                   type: string
 *                   example: "MongoDB error message here"
 */
router.post("/addSubSection", auth, isInstructor, createSubSection);

/**
 * @swagger
 * /course/getAllCourses:
 *   get:
 *     summary: Get all courses
 *     tags:
 *       - Course
 *     description: Retrieves a list of all available courses along with basic details such as name, price, thumbnail, instructor, ratings, and enrolled students.
 *     responses:
 *       200:
 *         description: Courses fetched successfully
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
 *                   example: "Course fetched successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       courseName:
 *                         type: string
 *                         example: "JavaScript for Beginners"
 *                       price:
 *                         type: number
 *                         example: 49.99
 *                       thumbnail:
 *                         type: string
 *                         format: uri
 *                         example: "https://example.com/course-thumbnail.jpg"
 *                       instructor:
 *                         type: object
 *                         description: Instructor details
 *                       ratingAndReviews:
 *                         type: array
 *                         description: List of ratings and reviews
 *                         items:
 *                           type: object
 *                       studentsEnrolled:
 *                         type: number
 *                         example: 1500
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
 *                   example: "Error while fetching courses"
 *                 error:
 *                   type: string
 *                   example: "MongoDB error message here"
 */
router.get("/getAllCourses", getAllCourses);

/**
 * @swagger
 * /course/getCourseDetails/{courseId}:
 *   get:
 *     summary: Get course details by ID
 *     tags:
 *       - Course
 *     description: Retrieves details of a specific course by its ID, including instructor details, category, ratings, and content.
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the course to retrieve details for.
 *         example: "65b8f9a0c0a3a12345d67891"
 *     responses:
 *       200:
 *         description: Course details retrieved successfully
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
 *                   example: "Course details retrieved successfully."
 *                 data:
 *                   type: object
 *                   properties:
 *                     courseName:
 *                       type: string
 *                       example: "JavaScript for Beginners"
 *                     instructor:
 *                       type: object
 *                       description: Instructor details
 *                     category:
 *                       type: string
 *                       example: "Programming"
 *                     ratingAndReviews:
 *                       type: array
 *                       description: List of ratings and reviews
 *                       items:
 *                         type: object
 *                     courseContent:
 *                       type: array
 *                       description: Course sections and subsections
 *                       items:
 *                         type: object
 *       400:
 *         description: Bad request (missing or invalid course ID)
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
 *         description: Course not found
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
 *                   example: "An error occurred while fetching course details. Please try again later."
 *                 error:
 *                   type: string
 *                   example: "MongoDB error message here"
 */
router.get("/getCourseDetails/:courseId", getCourseDetails);

/**
 * @swagger
 * /course/createCategory:
 *   post:
 *     summary: Create a new category
 *     tags:
 *       - Category
 *     description: Creates a new category with a name and optional description.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Web Development"
 *               description:
 *                 type: string
 *                 example: "Courses related to web development."
 *     responses:
 *       201:
 *         description: Category created successfully
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
 *                   example: "Category created successfully."
 *                 data:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Web Development"
 *                     description:
 *                       type: string
 *                       example: "Courses related to web development."
 *       400:
 *         description: Bad request (missing category name)
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
 *                   example: "Category name is required."
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
 *                   example: "Failed to create category. Please try again later."
 *                 error:
 *                   type: string
 *                   example: "MongoDB error message here"
 */
router.post("/createCategory", auth, isAdmin, createCategory);

/**
 * @swagger
 * /course/showAllCategories:
 *   get:
 *     summary: Retrieve all categories
 *     tags:
 *       - Category
 *     description: Fetches a list of all available categories with their names and descriptions.
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
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
 *                   example: "Categories retrieved successfully."
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: "Web Development"
 *                       description:
 *                         type: string
 *                         example: "Courses related to web development."
 *       404:
 *         description: No categories found
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
 *                   example: "No categories found."
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
 *                   example: "Failed to retrieve categories. Please try again later."
 *                 error:
 *                   type: string
 *                   example: "MongoDB error message here"
 */
router.get("/showAllCategories", showAllCategories);

/**
 * @swagger
 * /course/categoryPageDetails/{categoryId}:
 *   get:
 *     summary: Retrieve details of a specific category
 *     tags:
 *       - Category
 *     description: Fetches courses related to a specific category along with top-selling courses across all categories.
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the category to retrieve details for.
 *     responses:
 *       200:
 *         description: Category page details retrieved successfully
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
 *                   example: "Category page details retrieved successfully."
 *                 selectedCourses:
 *                   type: array
 *                   items:
 *                     type: object
 *                 differentCourses:
 *                   type: array
 *                   items:
 *                     type: object
 *                 mostSellingCourses:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Missing category ID
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
 *                   example: "Category ID is required."
 *       404:
 *         description: Category or courses not found
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
 *                   example: "Category not found." or "No courses found for the selected category."
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
 *                 error:
 *                   type: string
 *                   example: "MongoDB error message here"
 */
router.get("/categoryPageDetails/:categoryId", categoryPageDetails);

/**
 * @swagger
 * /course/createRating/{courseId}:
 *   post:
 *     summary: Create a rating and review for a course
 *     tags:
 *       - Course
 *     description: Allows enrolled students to rate and review a course.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the course to be reviewed.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4.5
 *               review:
 *                 type: string
 *                 example: "Great course with in-depth explanations."
 *     responses:
 *       201:
 *         description: Rating and review created successfully.
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
 *                   example: "Rating and review created successfully."
 *                 data:
 *                   type: object
 *       400:
 *         description: Missing required fields (rating or review).
 *       403:
 *         description: User is not enrolled in the course.
 *       409:
 *         description: User has already reviewed the course.
 *       500:
 *         description: Internal server error.
 */
router.post("/createRating/:courseId", auth, isStudent, createRating);

/**
 * @swagger
 * /course/getAverageRating/{courseId}:
 *   get:
 *     summary: Get the average rating of a course
 *     tags:
 *       - Course
 *     description: Fetches the average rating for a given course based on student reviews.
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the course for which the average rating is needed.
 *     responses:
 *       200:
 *         description: Successfully retrieved the average rating.
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
 *                   example: "Average rating retrieved successfully."
 *                 averageRating:
 *                   type: number
 *                   example: 4.2
 *       400:
 *         description: Invalid course ID format.
 *       500:
 *         description: Internal server error.
 */
router.get("/getAverageRating/:courseId", getAverageRating);

/**
 * @swagger
 * /course/getReviews:
 *   get:
 *     summary: Get all course reviews
 *     tags:
 *       - Reviews
 *     description: Retrieves all course reviews sorted by rating in descending order.
 *     responses:
 *       200:
 *         description: Successfully retrieved all reviews.
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
 *                   example: "All reviews fetched successfully."
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user:
 *                         type: object
 *                         properties:
 *                           firstName:
 *                             type: string
 *                           lastName:
 *                             type: string
 *                           email:
 *                             type: string
 *                           image:
 *                             type: string
 *                             format: uri
 *                       course:
 *                         type: object
 *                         properties:
 *                           courseName:
 *                             type: string
 *                       rating:
 *                         type: number
 *                       review:
 *                         type: string
 *       500:
 *         description: Internal server error.
 */
router.get("/getReviews", getAllRating);

module.exports = router;
