const Profile = require("../models/Profile");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const redisClient = require("../config/redisClient");

// update profile
exports.updateProfile = async (req, res) => {
  try {
    // get data
    const { dateOfBirth = "", gender, about = "", contactNumber } = req.body;

    // get userId
    const userId = req.user.id;

    // validate
    if (!contactNumber || !userId) {
      return res.status(400).json({
        success: false,
        errorCode: "VALIDATION_ERROR",
        message:
          "Required fields are missing. Please provide contactNumber, gender, and userId.",
      });
    }

    // find profile
    const userDetails = await User.findById(userId);
    if (!userDetails) {
      return res.status(404).json({
        success: false,
        errorCode: "USER_NOT_FOUND",
        message: "User not found. Please check the userId and try again.",
      });
    }
    const profileId = userDetails.additionalDetails;
    const profileDetails = await Profile.findById(profileId);
    if (!profileDetails) {
      return res.status(404).json({
        success: false,
        errorCode: "PROFILE_NOT_FOUND",
        message: "Profile not found for the given user.",
      });
    }

    // update profile
    profileDetails.dateOfBirth = dateOfBirth;
    profileDetails.gender = gender;
    profileDetails.about = about;
    profileDetails.contactNumber = contactNumber;
    await profileDetails.save();

    await redisClient.del(`user:${userId}`);

    // ret res
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully!",
      data: profileDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      errorCode: "INTERNAL_SERVER_ERROR",
      message:
        "Internal Server Error: Unable to update profile. Please try again later.",
      errorDetails: error.message,
    });
  }
};

// schedule account delete
exports.scheduleAccountDeletion = async (req, res) => {
  try {
    const userId = req.user.userId;

    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + 5);

    await User.findByIdAndUpdate(userId, {
      scheduledForDeletion: deletionDate,
    });

    return res.status(200).json({
      success: true,
      message: "Account deletion scheduled in 5 days.",
    });
  } catch (error) {
    console.error("Error scheduling account deletion:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to schedule account deletion.",
    });
  }
};

// delete profile
exports.deleteProfile = async (userId) => {
  try {
    // Find user
    const userDetails = await User.findById(userId);
    if (!userDetails) {
      console.log(`User ${userId} not found.`);
      return;
    }

    // Delete profile
    await Profile.findByIdAndDelete(userDetails.additionalDetails);

    // Unenroll user from enrolled courses
    await Course.updateMany(
      { studentsEnrolled: userId },
      { $pull: { studentsEnrolled: userId } }
    );

    // Delete user
    await User.findByIdAndDelete(userId);

    console.log(`User ${userId} deleted successfully.`);
  } catch (error) {
    console.error(`Error deleting user ${userId}:`, error);
  }
};

// get user details
exports.getUserDetail = async (req, res) => {
  try {
    // fetch id
    const userId = req.user.userId;

    // validate and get from db
    const cacheKey = `user:${userId}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        success: true,
        message: "User details fetched from cache",
        user: JSON.parse(cachedData),
      });
    }

    const userDetails = await User.findById(userId)
      .populate("additionalDetails")
      .populate("courses")
      .exec();
    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await redisClient.setex(cacheKey, 1800, JSON.stringify(userDetails));

    // ret res
    return res.status(200).json({
      success: true,
      message: "User details fetched successfully",
      user: userDetails,
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user details. Please try again later.",
      error: error.message,
    });
  }
};

exports.getAllUserDetails = async (req, res) => {
  try {
    const id = req.user.id;
    const userDetails = await User.findById(id)
      .populate("additionalDetails")
      .exec();
    console.log(userDetails);
    res.status(200).json({
      success: true,
      message: "User Data fetched successfully",
      data: userDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id;

    const userDetails = await User.findOne({
      _id: userId,
    })
      .populate("courses")
      .exec();

    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find user with id: ${userDetails}`,
      });
    }

    return res.status(200).json({
      success: true,
      data: userDetails.courses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateDisplayPicture = async (req, res) => {
  try {
    if (!req.files || !req.files.displayPicture) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    const displayPicture = req.files.displayPicture;
    const userId = req.user.id;

    const allowedFormats = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedFormats.includes(displayPicture.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file format. Only JPEG and PNG allowed",
      });
    }

    if (displayPicture.size > 2 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: "File size too large. Max 2MB allowed.",
      });
    }

    const image = await uploadImageToCloudinary(
      displayPicture,
      process.env.FOLDER_NAME,
      1000,
      1000
    );

    const updatedProfile = await User.findByIdAndUpdate(
      { _id: userId },
      { image: image.secure_url },
      { new: true }
    );

    res.send({
      success: true,
      message: `Image Updated successfully`,
      updatedProfile,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
