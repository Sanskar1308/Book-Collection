require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const app = express();
const port = 3001;
const Collection = require("./collection");
const User = require("./user");
const mongoose = require("mongoose");
const tokenBlacklist = new Set();
const crypto = require("crypto");

mongoose
  .connect("mongodb+srv://admin:aKSHw2njjioupAYz@cluster0.bxkhk0r.mongodb.net/")
  .then(() => console.log("connected to MongoDB...."))
  .catch((err) => console.log("Couldn't connect to MongoDB!!"));

app.use(express.json({ extended: false }));

const corsOptions = {
  origin: "http://localhost:3000", // Allow requests from this origin
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Allowed methods
  credentials: true, // Allow cookies to be sent with requests
  optionsSuccessStatus: 204, // Some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

const authenticatetoken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).send();

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log("Decoded Token: ", decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Token verification failed: ", err);
    return res.sendStatus(403);
  }
};

function paginationResult(model) {
  return async (req, res, next) => {
    const page = parseInt(req.query.page || 1);
    const limit = parseInt(req.query.limit || 5);

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const resultCollection = {};

    try {
      const userId = req.user.userId; // Extract userId from authenticated token

      // Get the total number of documents that match the userId
      const totalDocuments = await model.countDocuments({ userId });

      resultCollection.totalUser = totalDocuments;
      resultCollection.pageCount = Math.ceil(totalDocuments / limit);

      if (startIndex > 0) {
        resultCollection.previous = {
          page: page - 1,
          limit: limit,
        };
      }

      if (endIndex < totalDocuments) {
        resultCollection.next = {
          page: page + 1,
          limit: limit,
        };
      }

      resultCollection.resultCollection = await model
        .find({ userId })
        .limit(limit)
        .skip(startIndex)
        .exec();

      res.paginatedResult = resultCollection;
      console.log(resultCollection);
      next();
    } catch (e) {
      res.status(500).send({ msg: e.message });
    }
  };
}

/*Book's apis*/
app.post("/collection", authenticatetoken, async (req, res) => {
  try {
    const { title, author } = req.body;
    const userId = req.user.userId;
    console.log("userId", userId);
    // Validate the user ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).send({ error: "Invalid user ID" });
    }

    let collection = new Collection({
      title,
      author,
      userId, // Set the user ID in the collection
    });
    collection = await collection.save();
    res.send(collection);
  } catch (err) {
    res.status(400).send(err);
    console.log(err);
  }
});

app.get(
  "/collection",
  authenticatetoken,
  paginationResult(Collection),
  async (req, res) => {
    res.send(res.paginatedResult);
  }
);

app.get("/bookList", authenticatetoken, async (req, res) => {
  const userId = req.user.userId; // Extract userId from authenticated token
  const collection = await Collection.find({ userId });
  if (!collection) {
    return res.status(404).send("Collection not found");
  }
  res.send(collection);
});

app.get("/collection/:id", authenticatetoken, async (req, res) => {
  const userId = req.user.userId; // Extract userId from authenticated token
  const collection = await Collection.findOne({ _id: req.params.id, userId });
  if (!collection) {
    return res.status(404).send("Collection not found");
  }
  res.send(collection);
});

app.put("/collection/:id", authenticatetoken, async (req, res) => {
  const collection = await Collection.findByIdAndUpdate(
    req.params.id,
    { title: req.body.title, author: req.body.author },
    { new: true }
  );
  if (!collection) {
    res.status(404).send("Collection not Found!!");
  }

  res.send(collection);
});

app.delete("/collection/:id", authenticatetoken, async (req, res) => {
  const collectionIndex = await Collection.findByIdAndDelete(req.params.id);
  if (!collectionIndex) {
    res.status(404).send("Collection not Found!");
  }

  res.status(204).send();
});

app.post("/signup", async (req, res) => {
  try {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const exisitingUser = await User.findOne({ email: req.body.email });

    if (exisitingUser) {
      return res.status(400).send("User already exists");
    }

    let user = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    });

    user = await user.save();
    res.json({
      msg: "User created successfully",
      user: user,
    });
  } catch {
    res.status(500).send();
  }
});

app.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(400).send("Cannot find user");
  }
  try {
    if (await bcrypt.compare(req.body.password, user.password)) {
      const token = jwt.sign(
        { userId: user._id },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: "1h",
        }
      );

      await user.save(); // Save the updated user document
      console.log("Updated User:", user);

      res.json({
        msg: "Login successful",
        token: token,
      });
    } else {
      res.status(400).send("Not valid password");
    }
  } catch {
    res.status(500).send();
  }
});

app.post("/logout", authenticatetoken, (req, res) => {
  try {
    // Extract the token from the authorization header
    const token = req.headers.authorization?.split(" ")[1];
    // Add the token to the blacklist
    token && tokenBlacklist.add(token);

    // Respond with a success message
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error during logout", error: error.message });
  }
});

function generateOtp() {
  const otp = crypto.randomBytes(3).toString("hex");
  return parseInt(otp, 16).toString().slice(0, 6);
}

app.post("/forgetPassword", async (req, res) => {
  const oldUser = await User.findOne({ email: req.body.email });
  if (!oldUser) {
    return res.send({ status: "User not found!!" });
  }

  try {
    const otp = generateOtp();
    oldUser.resetPasswordOTP = otp;
    oldUser.resetPasswordExpires = Date.now() + 300000; // 5 minutes
    await oldUser.save();

    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD_APP_EMAIL,
      },
    });

    var mailOptions = {
      from: process.env.EMAIL,
      to: "chiraniasanskar@gmail.com",
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        return res.status(500).send({ status: "Failed to send email" });
      } else {
        console.log("Email sent: " + info.response);
        return res.send({ msg: "OTP sent to email" });
      }
    });
  } catch (e) {
    console.log(e);
    res.status(500).send({ status: "An error occurred" });
  }
});

// app.get("/resetPassword/:id/:token", async (req, res) => {
//   const { id, token } = req.params;
//   console.log(req.params);
//   const oldUser = await User.findOne({ _id: id });
//   if (!oldUser) {
//     return res.json({
//       status: "User doesn't exist!!",
//     });
//   }
//   try {
//     const verify = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
//     res.json({ msg: "Verified" });
//   } catch (e) {
//     res.json({ msg: "Not verified" });
//   }
// });

app.post("/verifyOtp", async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email: email });

  if (!user) {
    return res.status(400).send({ status: "User not found!" });
  }

  if (user.resetPasswordOTP === otp && user.resetPasswordExpires > Date.now()) {
    return res.send({ status: "OTP verified. Proceed to reset password." });
  } else {
    return res.status(400).send({ status: "Invalid or expired OTP!" });
  }
});

app.post("/resetPassword", async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const user = await User.findOne({ email: email });

  if (!user) {
    return res.status(400).send({ status: "User not found!" });
  }

  if (user.resetPasswordOTP === otp && user.resetPasswordExpires > Date.now()) {
    const encryptedPassword = await bcrypt.hash(newPassword, 10);
    await User.updateOne(
      {
        _id: user._id,
      },
      {
        $set: {
          password: encryptedPassword,
        },
      }
    );

    // Clear resetPasswordOTP and resetPasswordExpires
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Send success response
    return res.status(200).json({
      status: "Password has been reset successfully.",
    });
  } else {
    return res.status(400).send({ status: "Invalid or expired OTP!" });
  }
});

app.listen(port);
