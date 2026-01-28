const express = require('express');
const router = express.Router();
const protect = require("../middlewares/authMiddlewares");
const {registerUser,loginUser,forgotPassword,resetPassword} = require("../controllers/authControllers");

//----routes user jab register kartaa haa toh vo apna aik image bna leta ha 
// jab vo login karta ha toh us ka pass tokrn ata ha jo kahta ka ka han tum
//  hmaara user ho phir us token ko verify kia jata ha protected route se 

router.post("/register", registerUser);
router.post("/login", loginUser);

//---protected route ka matlab verify kar ka user ko daata tak ki acccess dena ya token ko verify karta ha 

router.get("/profile",protect,(req,res) => {
    res.json({
        message: "User is created successfully",
        user : req.body
    });
});

//-----link se new password generate karna ka lia or usko
//  Frontend token + new password backend ko bhejta hai
router.post("/reset-password/:token",resetPassword);

//-----email bhejna ka lia frontend se backend tak
router.post("/forgot-password",forgotPassword);

module.exports = router;
