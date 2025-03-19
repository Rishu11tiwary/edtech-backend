const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const emailTemplate = require("../mail/emailVerificationTemplate");

const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: 20*60
    }
});


async function sendVerificationEmail(email, otp) {
    try {
        await mailSender(email, "verification OTP from StudyNotion", emailTemplate(otp));
    } catch {
        console.log("Error sending otp mail", console.log(error.message));
        throw error;
    }
}

// OTPSchema.pre("save", async function(next){
//     // Only send an email when a new document is created
//     if (this.isNew) {
// 		await sendVerificationEmail(this.email, this.otp);
// 	}
//     next();
// })

OTPSchema.pre("save", async function (next) {
    if (this.isNew) {
        try {
            await sendVerificationEmail(this.email, this.otp);
        } catch (error) {
            console.error("Error sending email:", error.message);
        }
    }
    next();
});


module.exports = mongoose.model("OTP", OTPSchema);