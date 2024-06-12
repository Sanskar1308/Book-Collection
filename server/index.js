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

mongoose
  .connect("mongodb+srv://admin:aKSHw2njjioupAYz@cluster0.bxkhk0r.mongodb.net/")
  .then(() => console.log("connected to MongoDB...."))
  .catch((err) => console.log("Couldn't connect to MongoDB!!"));

app.use(express.json({ extended: false }));
app.use(
  cors({
    origin: "http://localhost:3000", // Adjust based on your frontend's URL
    credentials: true,
  })
);

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

const forgetPassword = async (req, res) => {
  try {
    // Find the user by email
    const user = await User.findOne({ mail: req.body.email });

    // If user not found, send error message
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Generate a unique JWT token for the user that contains the user's id
    const token = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "10m",
      }
    );

    // Send the token to the user's email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD_APP_EMAIL,
      },
    });

    // Email configuration
    const mailOptions = {
      from: process.env.EMAIL,
      to: req.body.email,
      subject: "Reset Password",
      html: `<h1>Reset Your Password</h1>
      <p>Click on the following link to reset your password:</p>
      <a href="http://localhost:5173/reset-password/${token}">http://localhost:5173/reset-password/${token}</a>
      <p>The link will expire in 10 minutes.</p>
      <p>If you didn't request a password reset, please ignore this email.</p>`,
    };

    // Send the email
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        return res.status(500).send({ message: err.message });
      }
      res.status(200).send({ message: "Email sent" });
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    // Verify the token sent by the user
    const decodedToken = jwt.verify(
      req.params.token,
      process.env.ACCESS_TOKEN_SECRET
    );

    // If the token is invalid, return an error
    if (!decodedToken) {
      return res.status(401).send({ message: "Invalid token" });
    }

    // find the user with the id from the token
    const user = await User.findOne({ _id: decodedToken.userId });
    if (!user) {
      return res.status(401).send({ message: "no user found" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    req.body.newPassword = await bcrypt.hash(req.body.newPassword, salt);

    // Update user's password, clear reset token and expiration time
    user.password = req.body.newPassword;
    await user.save();

    // Send success response
    res.status(200).send({ message: "Password updated" });
  } catch (err) {
    // Send error response if any error occurs
    res.status(500).send({ message: err.message });
  }
};

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

app.post("/forgetPassword", forgetPassword);

app.post("/resetPassword/:token", resetPassword);

app.listen(port);
