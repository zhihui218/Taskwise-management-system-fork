// Handle requests from user && send response to user
const userService = require('../services/user.service');
const middleware = require('../utils/middleware');
const python_server = require('../utils/python-server-conn');
const bcrypt = require('bcrypt');
// Access profile picture of the user
const cloudinary = require('../utils/cloudinary');
const formidable = require('formidable');
//? Sent "Reset Password Link" to the user
const nodemailer = require('nodemailer');
// Access environment variables
require('dotenv').config()

exports.register = async(req, res, next) => {
    try {
        //* Possible "undefined" for `joining_date` (ONLY "ENGINEER" / "MANAGER" Needs `joining_date`)
        // const { email, name, password, role, joining_date } = req.body;
        const data = req.body;

        const userExist = await userService.checkUser(data.email);

        // Avoid storing two user with "same" email & role
        if (userExist != null && userExist.role == data.role) {
            res.status(400).json({
                status: false,
                message: "User exists, please try again!"
            });
            return next(new Error("Email does exist"));
        }

        const user = await userService.registerUser(data);

        res.status(200).json({
            status: true,
            user: user
        });

    } catch (error) {
        return next(error);
    }
}

exports.login = async(req, res, next) => {
    try {

        const { email, password } = req.body;

        const user = await userService.checkUser(email);

        if (!user) {
            res.status(400).json({
                    status: false,
                    message: "User doesn't exist!"
                })
                // Safely return error to avoid terminating the server
            return next(new Error("User doesn't exist!"));
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            res.status(400).json({
                status: false,
                message: "Invalid password"
            })
            return next(new Error("Invalid password"));
        }

        let tokenData = { user };

        const jwtToken = await userService.generateToken(tokenData, "secretKey", "1h");

        res.status(200).json({
            status: true,
            token: jwtToken,
        });

    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Something wrong happens, please try again later"
        })
        return next(error);
    }
}


exports.checkUserStatus = async(req, res, next) => {
    try{
        const _id = req.params._id;

        const user_status = await userService.checkUserStatus(_id);

        res.status(200).json(user_status);
    }catch(error){
        res.status(500).json(undefined);
    }
}

exports.updateUser = async(req, res, next) => {
    try {

        const profile = req.file;

        const updatedUser = req.body;

        const _id = req.params.id;

        const salt = await bcrypt.genSalt(10);

        if (updatedUser.password) updatedUser.password = await bcrypt.hash(updatedUser.password, salt);

        if (profile) {
            //* Destroy the original profile picture of the user
            await cloudinary.uploader.destroy(_id);

            //* Upload the new profile picture of the user
            const result = await cloudinary.uploader.upload(profile.path, { public_id: _id, folder: "/profiles" });

            updatedUser.profile = {
                cloudinary_id: result.public_id,
                profile_url: result.secure_url
            }
        }

        //* Update the user information in the database
        const user = await userService.updateUserInfo(_id, updatedUser);

        //* Whenever the user's details are updated, we should provide a new token (consists of user details) to make him/her valid during the session
        let tokenData = { user };

        const jwtToken = await userService.generateToken(tokenData, "secretKey", "1h");

        res.status(200).json({
            status: true,
            token: jwtToken,
        })

    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Something wrong happens, please try again later"
        });
        return next(error);
    }
}

//? MANAGER updates engineers' details (Performance Prediction)
exports.updateEngineer = async(req, res, next) => {
    try{
        const updatedDetails = req.body;
        const user_id = req.params.id;

        // 1. Update user details
        const user = await userService.updateUserInfo(user_id, updatedDetails);
        // 2. Send data to python server to do prediction
        const performance_rating = await python_server.makePrediction(user);
        // 3. Save the predicted performance as historical rating for future review
        const user_latest = await userService.updateUserInfo(user_id, {PerformanceRating: performance_rating});
        // 4. Get the fields that are visible to the "MANAGER"
        const engineer = await userService.getUserById(user_latest._id);
        // 4. Send the "ENGINEER" back to the "MANAGER"
        res.status(200).json(engineer);

    }catch(error){
        console.error(error);
        res.status(500).json(undefined);
    }
}

//* Get the information of the current user
exports.getInfo = async(req, res, next) => {
    try {
        const _id = req.params.id;

        const user = await userService.getUserInfo(_id);

        res.status(200).json({
            status: true,
            user: user
        })

    } catch (error) {

        res.status(500).json({
            status: false,
        })
        return next(error);
    }
}

//? Get the remarks and KPI of engineer
exports.getRemarksAndKPI = async(req, res, next) => {
    try {
        const _id = req.params.id;

        const remarksAndKPI = await middleware.calculateRemarksAndKPI(_id);

        res.status(200).json(remarksAndKPI);

    } catch (error) {

        res.status(500).json(undefined);
        return next(error);
    }
}

exports.getEngineers = async(req, res, next) => {
    try {

        const engineerList = await userService.getEngineers();

        res.status(200).json({ engineers: engineerList });

    } catch (error) {

        res.status(500).json({
            status: false,
        })

        return next(error);
    }
}

exports.getClients = async(req, res, next) => {
    try {

        const clientList = await userService.getClients();

        res.status(200).json({ clients: clientList });

    } catch (error) {

        res.status(500).json({
            status: false,
        })

        return next(error);
    }
}

//* Get the "ENGINEER" / "CLIENT" when CRUD "project / task / ticket"
exports.getUserById = async(req, res, next) => {
    try {

        const _id = req.params._id;

        const user = await userService.getUserById(_id);

        res.status(200).json({ user: user });

    } catch (error) {

        res.status(500).json({
            status: false,
        })

        return next(error);
    }
}

//? Set the reset password link when the user click on "Forgot Password"
exports.sendResetLink = async(req, res, next) => {
    try{
        const { email } = req.body;
        //* 1. Check whether the user exists
        const user = await userService.checkUser(email);
        if(!user){ 
            res.status(400).json(false);
            return next(new Error("User doesn\'t exist"));
        }

        //* 2. Generate the unique signature of the current user
        const token = await userService.generateToken({ _id: user._id, email: user.email }, process.env.RESET_PASSWORD_KEY, "5m")

        //* 3. Set up the `nodemailer` to send email to the user ⁡⁢⁣⁢(𝗵𝘁𝘁𝗽𝘀://𝘄𝘄𝘄.𝘆𝗼𝘂𝘁𝘂𝗯𝗲.𝗰𝗼𝗺/𝘄𝗮𝘁𝗰𝗵?𝘃=𝗹𝗕𝗥𝗻𝗟𝗫𝘄𝗷𝗟𝘄𝟬)⁡⁡⁡
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.HOST_EMAIL,
                pass: process.env.HOST_PASSWORD,
            },
        });

        //* 4. Configure the email format
        var mailOptions = {
            from: process.env.HOST_EMAIL,
            to: email,
            subject: "Reset Password Link",
            html: 
            `
            <h2>Please click on the given link to reset your password</h2>
            <p>${process.env.CLIENT_SITE_URL}/${token}</p>
            `
        };
    
        transporter.sendMail(mailOptions, function (error, info) {
        if (error) console.log(error);
        else console.log("Email sent: " + info.response);
        });

        res.status(200).json(true);
    }catch(error){
        res.status(500).json(false);
    }
}

//? Allow the user reset the password only if the link is still valid
exports.verifyResetLink = async(req, res, next) => {
    try{
        const _id = req.decoded_result._id;
        const canResetPassword = req.canResetPassword;
        //* 1. Check whether the user exists
        const user = await userService.checkUser(undefined, _id);
        if(!user){ 
            res.status(400).json('User doesn\'t exist'); 
            return next(new Error("User doesn\'t exist"));
        }

        //* 2. Redirect the user to the frontend page, if the "Reset Password Link" is valid
        if(user && canResetPassword) {
            res.redirect(`http://localhost:4200/auth/reset-password/${req.params.token}`);
            return;
        }
    }catch(error){
        res.status(500).json('Something went wrong. Please try again later');
    }
}

//? Allow the user to reset his / her password since the "Reset Password Link" is valid
exports.resetPassword = async(req, res, next) => {
    try{
        const { password } = req.body;
        const _id = req.decoded_result._id;
        const canResetPassword = req.canResetPassword;

        //* 2. Update the user's password
        if(canResetPassword){
            const salt = await bcrypt.genSalt(10);
            hashPass = await bcrypt.hash(password, salt);
            await userService.updateUserPassword(_id, hashPass);
        }
        
        res.status(200).json(true);

    }catch(error){
        res.status(500).json(false);
    }
}