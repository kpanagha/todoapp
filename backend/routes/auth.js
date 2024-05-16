const router = require("express").Router();
const User = require("../models/user.js");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const UserOTPverification = require('../models/UserOTPVerification.js');
const user = require("../models/user.js");

// Create a transporter using SMTP transport
const transporter = nodemailer.createTransport({
  service: "gmail",
    auth: {
    user: 'suharabeevi441@gmail.com',
    pass: 'kzewaemdrqojlswv'
    ,
  }
});

router.post("/register", async (req, res) => {
  try {
    //console.log(req.body);
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashpassword = bcrypt.hashSync(password);
    const user = new User({ username, email, password: hashpassword, verified:false });
    await user
      .save()
      // .then(() => res.status(200).json({ message: "User added" }));
      .then((savedUser) =>
      sentOTPverificationEmail(savedUser,res)
        // res.status(200).json({ message: "User added", _id: savedUser._id })
      );
  } catch (error) {
    console.log(error);
    res.status(500).json({      message: error.message,    });
  }
});

const sentOTPverificationEmail = async ({ _id, email }, res) => {
  
  try {
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
   console.log(otp,'otp');
    // Mail options
    const mailoptions = {
      from: 'suharabeevi441@gmail.com',
      to: email,
      subject: 'Verify your email', // Typo fixed
      text: `Your OTP for login is: ${otp}`,
        };
    const saltRound = 10;
    const hashedOTP = await bcrypt.hash(otp, saltRound);

    const newOtpverification = new UserOTPverification({
      userId: _id,
      otp: hashedOTP,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000, // Expiration time fixed
    });

    await newOtpverification.save();

      transporter.sendMail(mailoptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });
    
    res.json({
      status: "PENDING",
      message: "Verification OTP sent to email",
      data: {
        userId: _id,
        email,
      },
    });
  } catch (error) {
    res.json({
      status: "FAILED",
      message: error.message,
    });
  }
};

router.post("/verifyOTP", async (req, res) => {
  try {
    console.log(req.body,"beiiiiiii");
    const { userId, otp } = req.body;
    if (!userId || !otp) {
      throw new Error("Empty otp details are not allowed");
    } else {
      const UserOtpverificationRecord = await UserOTPverification.find({
        userId,
      });
      console.log(UserOtpverificationRecord);
      if (UserOtpverificationRecord.length <= 0) {
        throw new Error(
          "Account record doesn't exist or has been verified already. please sign up or log in"
        );
      } else {
        const { expiresAt } = UserOtpverificationRecord[0];
        const hashedOTP = UserOtpverificationRecord[0].otp;
        if (expiresAt < Date.now()) {
          await UserOTPverification.deleteMany({ userId });
          throw new Error("Code has expired. Please request again.");
        } else {
          const ValidOtp = await bcrypt.compare(otp, hashedOTP); 
          console.log(ValidOtp,"validotp");
          // Await the bcrypt.compare function
          if (!ValidOtp) {
            throw new Error("Invalid otp");
          } else {
            await user.updateOne({ _id: userId }, { $set: { verified: true } }); // Correctly update the user document
            await UserOTPverification.deleteMany({ userId });
            res.json({
              status: "VERIFIED",
              message: "User Email Verified Successfully",
            });
          }
        }
      }
    }
  } catch (error) {
    return res.status(500).json({
      status: "FAILED",
      message: error.message,
    });
  }
});




router.post("/signin", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }
    if (!user.verified) {
      return res.status(400).json({ message: "User is not verified." });
    }

    const isPasswordCorrect = bcrypt.compareSync(
      req.body.password,
      user.password
    );
    if (!isPasswordCorrect) {
      return res
        .status(400)
        .json({ message: "Incorrect password. Please try again." });
    }

    const { password, ...others } = user._doc;
    return res.status(200).json({message:"user found",others});

  } catch (error) {

    return res.status(500).json({
      message:
        "An error occurred during the sign-in process. Please try again later.",
    });
  }
});
module.exports = router;