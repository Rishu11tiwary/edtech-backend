const User = require("../models/User");
const OTP = require("../models/Otp");
const Profile = require("../models/Profile");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailSender = require("../utils/mailSender");
const { passwordUpdated } = require("../mail/passwordUpdate");
require("dotenv").config();
const dns = require("dns");

//send Otp
exports.sendotp = async(req, res) => {
    try {
        const {email} = req.body;

        if(email == null) {
            return res.status(400).json({
                success:false,
                message: "Please provide an email"
            })
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                errorCode: "USER_ALREADY_REGISTERED",
                message: "User is already registered with this email.",
            });
        }

        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false
        });

        let result = await OTP.findOne({otp: otp});

        while (result) {
            var otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false
            });
            result = await OTP.findOne({otp});
        }

        const otpPayload = {email, otp};

        const otpBody = await OTP.create(otpPayload);
        console.log(otpBody);

        return res.status(200).json({
            success: true,
            message: "OTP has been sent successfully.",
            data: { email, otp }
        });
    } catch(error) {
        console.log("Error in sendOtp", error);
        return res.status(500).json({
            success: false,
            errorCode: "INTERNAL_SERVER_ERROR",
            message: "Failed to send OTP. Please try again later.",
            errorDetails: error.message
        });
    }
};

// Sign up
exports.signup = async(req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp
        } = req.body;
    
        if(!firstName || !lastName || !email || !password || !confirmPassword || !accountType || !otp) {
            return res.status(400).json({
                success: false,
                errorCode: "MISSING_FIELDS",
                message: "All mandatory fields are required."
            });
        }
    
        if(password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                errorCode: "PASSWORD_MISMATCH",
                message: "Password and confirmPassword do not match."
            });
        }
    
        const existingUser = await User.findOne({email});
    
        if(existingUser) {
            return res.status(400).json({
                success: false,
                errorCode: "USER_ALREADY_REGISTERED",
                message: "User is already registered with this email."
            });
        }
    
        const recentOtp = await OTP.find({email}).sort({createdAt: -1}).limit(1);
    
        if(recentOtp.length == 0) {
            return res.status(400).json({
                success: false,
                errorCode: "OTP_NOT_FOUND",
                message: "OTP not found. Please request a new one."
            });
        }

        if (otp !== recentOtp?.[0]?.otp) {
            return res.status(400).json({
                success: false,
                errorCode: "INVALID_OTP",
                message: "Invalid OTP. Please try again."
            });
        }
    
        const hashedPassword = await bcrypt.hash(password, 10);

        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null
        }); 

        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            accountType,
            contactNumber,
            additionalDetails: profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
        });

        return res.status(201).json({
            success: true,
            message: "User signed up successfully!",
            data: {
                userId: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                accountType: user.accountType
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            errorCode: "INTERNAL_SERVER_ERROR",
            message: "User registration failed. Please try again later.",
            errorDetails: error.message
        });
    }
}

//login
exports.login = async(req, res) => {
    try {
        const {email, password} = req.body;

        if(!email || !password) {
            return res.status(400).json({
                success: false,
                errorCode: "MISSING_FIELDS",
                message: "Email and password are required."
            });
        }

        const user = await User.findOne({email}).populate("additionalDetails");
        if(!user) {
            return res.status(401).json({
                success: false,
                errorCode: "USER_NOT_FOUND",
                message: "User not registered. Please sign up first."
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                errorCode: "INVALID_PASSWORD",
                message: "Incorrect password. Please try again."
            });
        }

        const payload = {
            email: user.email,
            id: user._id,
            accountType: user.accountType
        }

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "2h"
        });

        user.token = token;
        user.password = undefined;

        const options = {
            expires: new Date(Date.now() + 3*24*60*60*60*1000),
            httpOnly: true
        }

        return res.cookie("token", token, options).status(200).json({
            success: true,
            message: "Login successful.",
            data: {
                userId: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                accountType: user.accountType,
                token
            }
        });
    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({
            success: false,
            errorCode: "INTERNAL_SERVER_ERROR",
            message: "An error occurred while logging in. Please try again later.",
            errorDetails: error.message
        });
    }
};

//change password
exports.changePassword = async (req, res) => {
    try {
        // Extract userId from JWT auth middleware
        const userId = req.user.id;

        // Extract passwords from request body
        const { oldPassword, newPassword, confirmPassword } = req.body;

        // Validate required fields
        if (!oldPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                errorCode: "MISSING_FIELDS",
                message: "Old password, new password, and confirm password are required."
            });
        }

        // Find user in the database
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                errorCode: "USER_NOT_FOUND",
                message: "User not found. Please log in again."
            });
        }

        // Check if the old password is correct
        const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                errorCode: "INVALID_OLD_PASSWORD",
                message: "Old password is incorrect."
            });
        }

        // Ensure new password is different from old password
        if (oldPassword === newPassword) {
            return res.status(400).json({
                success: false,
                errorCode: "PASSWORD_SAME_AS_OLD",
                message: "New password must be different from the old password."
            });
        }

        // Ensure new password matches confirm password
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                errorCode: "PASSWORD_MISMATCH",
                message: "New password and confirm password do not match."
            });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password in the database
        user.password = hashedPassword;
        await user.save();

        // await sendPasswordChangeEmail(user.email);
        try {
			const emailResponse = await mailSender(
				updatedUserDetails.email,
				passwordUpdated(
					updatedUserDetails.email,
					`Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
				)
			);
			console.log("309 -> Email sent successfully:", emailResponse.response);
		} catch (error) {
			// If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
			console.error("Error occurred while sending email:", error);
			return res.status(500).json({
				success: false,
				message: "Error occurred while sending email",
				error: error.message,
			});
		}

        return res.status(200).json({
            success: true,
            message: "Password changed successfully. Please log in with your new password."
        });
    } catch (error) {
        console.error("Error in changePassword:", error);
        return res.status(500).json({
            success: false,
            errorCode: "INTERNAL_SERVER_ERROR",
            message: "An error occurred while updating the password. Please try again later.",
            errorDetails: error.message
        });
    }
};
