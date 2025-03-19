const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

exports.auth = async (req, res, next) => {
    try {
        //extract token
        const token = req.cookies.token ||
        req.body.token ||
        // req.header("Authorization").replace("Bearer ", "")||
        req.header("Authorization")?.split(" ")[1];

        //if token missing, ret res
        if(!token) {
        return res.status(401).json({
        success: false,
        message: "Token is missing"
        });
        }

        //verify the token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decodedToken;
        console.log("Token Verified:", decodedToken);
        next();
    } catch(error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong while validating the token"
        });
    }
}

//Student
exports.isStudent = async(req, res, next) => {
    try {
        if(req.user.accountType !== "Student") {
            return res.status(401).json({
                success: false,
                message: "This is protected route for students only"
            });
        }
        next();
    } catch(error) {
        return res.status(500).json({
            success: false,
            message: "User role cannot be verified, please try again"
        });
    }
}

//Admin
exports.isAdmin = async(req, res, next) => {
    try {
        if(req.user.accountType !== "Admin") {
            return res.status(401).json({
                success: false,
                message: "This is protected route for admin only"
            });
        }
        next();
    } catch(error) {
        return res.status(500).json({
            success: false,
            message: "User role cannot be verified, please try again"
        });
    }
}

//Instructor
exports.isInstructor = async(req, res, next) => {
    try {
        if(req.user.accountType !== "Instructor") {
            return res.status(401).json({
                success: false,
                message: "This is protected route for instructors only"
            });
        }
        next();
    } catch(error) {
        return res.status(500).json({
            success: false,
            message: "User role cannot be verified, please try again"
        });
    }
}