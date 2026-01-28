const User = require("../models/user");
//-----yaha par bcrypt or jwt ko is lia require karien ga kiun ka
// pahla user na verify hon aahaa or baad maa token generate hona ha
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
//----packages require karna hain taka reset or forgot pssword chal sakain
const crypto = require("crypto");
const nodemailer = require("nodemailer");

//----user ko register karain ga
exports.registerUser = async (req, res) => {
  console.log(req.body);
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    await User.create({ name, email, password: hashPassword });
    res.status(200).json({ message: "User is created succesfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//----user ko jab hum login karwain ga
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) return res.status(400).json({ message: "User does not exists" });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.json(500).json({ message: "Invalid email or password" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }  
}; 

//----forgot password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  let user;

  try {
    user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.verify();

    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const message = `Hi,\n\nClick this link to reset your password:\n${resetURL}`;

    await transporter.sendMail({
      from: `"Auth API" <no-reply@authapi.com>`,
      to: user.email,
      subject: "Password Reset Request",
      text: message,
    });

    res.status(200).json({ message: "Reset email sent successfully" });
  } catch (error) {
    console.log("EMAIL ERROR =>", error);

    if (user) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
    }
    res.status(500).json({ message: "Email could not be sent", error: error.message });
  }
};

//-----reset-password
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Token is invalid or expired" });
    }

    user.password = password;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
