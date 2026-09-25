const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const emailService = require("../services/email.service");
const tokenBlackListModel = require("../models/blackList.model")


async function userRegisterController(req, res) {

    try {

        const { email, password, name } = req.body;

        const isExists = await userModel.findOne({
            email: email
        });

        if (isExists) {
            return res.status(422).json({
                message: "User already exists with email.",
                status: "failed"
            });
        }

        const user = await userModel.create({
            email,
            password,
            name
        });

        // Send welcome email after registration
        await emailService.sendRegistertionEmail(
            user.email,
            user.name
        );

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            {
                expiresIn: "3d"
            }
        );

        res.cookie("token", token);

        return res.status(201).json({
            user: {
                _id: user._id,
                email: user.email,
                name: user.name
            },
            token
        });

    } catch (error) {

        console.error("Registration error:", error);

        return res.status(500).json({
            message: "Something went wrong",
            error: error.message
        });
    }
}


async function userLoginController(req, res) {

    try {

        const { email, password } = req.body;

        const user = await userModel
            .findOne({ email })
            .select("+password");

        if (!user) {
            return res.status(401).json({
                message: "Email or password is invalid"
            });
        }

        const isValidPassword = await user.comparePassword(password);

        if (!isValidPassword) {
            return res.status(401).json({
                message: "Email or password is invalid"
            });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            {
                expiresIn: "3d"
            }
        );

        res.cookie("token", token);

        return res.status(200).json({
            user: {
                _id: user._id,
                email: user.email,
                name: user.name
            },
            token
        });

    } catch (error) {

        console.error("Login error:", error);

        return res.status(500).json({
            message: "Something went wrong",
            error: error.message
        });
    }
}

async function   userLogoutController(req, res) {
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1]

        if(!token){
             return res.status(200).json({
                  message:"User loggout successfully"
             })
        }
        
        res.cookie("token","")

        await tokenBlackListModel.create({
             token: token


        })

        res.status(200).json({
             message:"User loggedout successfully"
        })
}

module.exports = {
    userRegisterController,
    userLoginController,
    userLogoutController
};