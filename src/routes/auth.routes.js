const express = require("express")
const authController = require("../contollers/auth.controller")


const router = express.Router()



router.post("/register",authController.userRegisterController)

router.post("/login",authController.userLoginController)

router.post("/logout",authController.userLogoutController)

module.exports = router