const User = require('../models/User');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const emailjs = require('@emailjs/nodejs');


const forgotPassword = async (req, res)=>{
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if(!user) return res.status(404).json({ message: "User not found" });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const resetToken = crypto
            .createHash('sha256')
            .update(otp)
            .digest('hex');

        const resetTokenExpire = Date.now() + 10 * 60 * 1000;

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpire = resetTokenExpire;
        await user.save();

        let emailSent = await sendOTP(user, otp);

        if (emailSent) {
            return res.status(200).json({ success: true, message: "OTP sent to email" });
        } else {
            // Rollback if email fails
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();

            console.error("FULL EMAIL ERROR:", emailSent); // Check if sendOTP returned an error object or false
            return res.status(500).json({ 
                message: "Email service failed", 
                // Add this temporarily to see the reason in Thunder Client
                debug_error: emailSent 
            });
    }  
        
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

const resetPassword = async (req, res)=>{
    try{
        const { otp, newPassword, confirmPassword } = req.body;
        if (newPassword !== confirmPassword) return res.status(400).json({ message: "Passwords do not match" });

        const resetToken = crypto
            .createHash('sha256')
            .update(otp)
            .digest('hex');
    const user = await User.findOne({
    resetPasswordToken: resetToken, 
    resetPasswordExpire: { $gt: Date.now() } 
});

if (!user) {
    return res.status(400).json({ 
        message: "OTP is invalid or has expired" 
    });
}

            
// After the password is successfully updated:
const salt = await bcrypt.genSalt(10);
const newHashedPassword = await bcrypt.hash(newPassword, salt);
user.password = newHashedPassword;
user.resetPasswordToken = undefined; // Deletes the field value
user.resetPasswordExpire = undefined; // Deletes the field value
user.isEmailVerified = true;
await user.save();

res.status(200).json({ message: "Password reset successfully, please Login" });

    } catch(error){
        res.status(500).json({
            message: error.message
        });
    }
}

const emailVerification = async (req, res)=>{
    try{
        const { email } = req.body;
        const user = await User.findOne({ email });

        if(!user) return res.status(404).json({ message: "User not found" });
        if(user.isEmailVerified) return res.status(400).json({ message: "Email already verified" });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const hashedToken = crypto
            .createHash('sha256')
            .update(otp)
            .digest('hex');

            user.verifyEmailToken = hashedToken;
            user.resetEmailVerificationExpire = Date.now() + 10 * 60 * 1000;
            await user.save();


      // WE AWAIT THE RESULT HERE
        const emailSent = await sendOTP(user, otp);

        if (emailSent) {
            return res.status(200).json({ success: true, message: "OTP sent to email" });
        } else {
            // Rollback if email fails
            user.verifyEmailToken = undefined;
            user.resetEmailVerificationExpire = undefined;
            await user.save();

            console.error("FULL EMAIL ERROR:", emailSent); // Check if sendOTP returned an error object or false
            return res.status(500).json({ 
                message: "Email service failed", 
                // Add this temporarily to see the reason in Thunder Client
                debug_error: emailSent 
            });
            // return res.status(500).json({ message: "Email service failed" });

        }

    }
    catch (error){
        res.status(500).json({
            message: error.message
        });
    }
}

const verifyEmail = async (req, res)=>{
    try{
        
        const { otp } = req.body;

        const hashedToken = crypto
            .createHash('sha256')
            .update(otp)
            .digest('hex');

        const user = await User.findOne({
            verifyEmailToken: hashedToken, 
            resetEmailVerificationExpire: { $gt: Date.now() } 
        });

        if (!user) {
        return res.status(400).json({ 
            message: "OTP is invalid or has expired" 
        });
    }
    user.isEmailVerified = true;
    user.verifyEmailToken = undefined;
    user.resetEmailVerificationExpire = undefined;
    await user.save();
    res.status(200).json({ message: "Email verified successfully" });

    } catch (error){
            res.status(500).json({
            message: error.message
        });
    }
}

// for password
// async function sendEmailOTP(res, user, otp) {
//         try {
//             sendOTP(res, user, otp);

//         } catch (emailError) {
//             // Rollback: clear fields if email fails
//             user.resetPasswordToken = undefined;
//             user.resetPasswordExpire = undefined;
//             await user.save();

//             return res.status(500).json({
//                 message: "Email could not be sent. Please try again.",
//                 error: emailError.text || emailError.message
//             });
//         }
// }

// // for email verification
// async function sendEmailVerificationOTP(res, user, otp) {
//     try{
//         await sendOTP(user, otp);

//     } catch (emailError){
//             user.verifyEmailToken = undefined;
//             user.resetEmailVerificationExpire = undefined;
//             await user.save();

//             return res.status(500).json({
//                 message: "Verification Email could not be sent. Please try again.",
//                 error: emailError.text || emailError.message
//             });
//     }
// }

// sends email for otp
async function sendOTP(user, otp){
    try{
    const templateParams = {
            to_name: user.name,
            to_email: user.email,
            otp: otp, // The actual 6-digit code
        };

            await emailjs.send(
                process.env.EMAILJS_SERVICE_ID,
                process.env.EMAILJS_TEMPLATE_ID,
                templateParams,
                {
                    publicKey: process.env.EMAILJS_PUBLIC_KEY,
                    privateKey: process.env.EMAILJS_PRIVATE_KEY, // Essential for Backend
                }
            );

            return true;
        }catch(error){
            console.error(error);
            return false;
        }
}

module.exports = { forgotPassword, resetPassword, emailVerification, verifyEmail };