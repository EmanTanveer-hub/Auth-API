const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
   name:{
     type: String,
     required: [true,"Name is required"],
     trim : true,
     minlength : 4
   },
   email:{
    type: String,
    required :[true ,"Email is required"],
    unique : true,
    trim : true,
    lowercase: true,
    match :[
       /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/ ,
       "Please enter valid email"
    ]
   },
   password:{
    type : String ,
    required : [true , "Password is required"],
    minlength : 6,
    select : false,
   },
       isVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
},{timestamps:true});

const User = mongoose.model("User" , userSchema);
module.exports = User;
