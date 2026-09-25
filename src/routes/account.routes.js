const express = require("express")
const authMiddleware = require("../middleware/auth.middleware")
const accountController = require("../contollers/account.controller")



const router = express.Router()


router.post("/",authMiddleware.authMiddleware,accountController.createAccountController)

router.get("/",authMiddleware.authMiddleware, accountController.getUserAccountController)

router.get("/balance/:accountId", authMiddleware.authMiddleware, accountController.getAccountBalanceController)




module.exports = router