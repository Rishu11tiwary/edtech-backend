const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");

// reset Password token
exports.resetPasswordToken = async (req, res) => {
  try {
    // fetch email from req
    const email = req.body.email;

    // email validation
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Your email is not registered with us",
      });
    }

    // generate token
    const token = crypto.randomUUID();

    //update user
    const updatedDetails = await User.findOneAndUpdate(
      { email: email },
      {
        token: token,
        resetPasswordExpires: Date.now() + 5 * 60 * 1000,
      },
      { new: true }
    );

    //create url
    const url = `http://localhost:3000/update-password/${token}`;

    //send mail
    await mailSender(
      email,
      "Reset Password Link",
      `Password Reset Link: ${url}`
    );

    //return res
    return res.status(200).json({
      success: true,
      message: "Email sent successfully, please check mail and reset password",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while sending password reset mail",
    });
  }
};

// reset password
exports.resetPassword = async (req, res) => {
  try {
    //fetch data
    const { password, confirmPassword, token } = req.body;

    //validation
    if (password !== confirmPassword) {
      return res.json({
        success: false,
        message: "Password and confirm password does not match",
      });
    }

    //fetch user details
    const user = await User.findOne({ token: token });

    //invalid token
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Token is invalid",
      });
    }

    // check expiery of token
    if (user.resetPasswordExpires < Date.now()) {
      return res.json({
        success: false,
        message: "token has expired",
      });
    }

    //hash pwd
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.findOneAndUpdate(
      { token: token },
      { password: hashedPassword },
      { new: true }
    );

    //return res
    res.status(200).json({
      success: true,
      message: "Password reset successfull",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while reseting password",
    });
  }
};
