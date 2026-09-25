const {Router} = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const transactionController = require('../contollers/transaction.controller') 



const transactionRoutes = Router();






transactionRoutes.post("/",authMiddleware.authMiddleware,transactionController.createTransaction)



transactionRoutes.post("/system/initial-funds", authMiddleware.authSystemUserMiddleware, transactionController.createInitialFundsTransaction)

 

module.exports = transactionRoutes;