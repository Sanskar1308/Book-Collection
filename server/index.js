require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
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

app.use(express.json());
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
    resultCollection.totalUser = model.length;
    resultCollection.pageCount = Math.ceil(model.length / limit);
    console.log(resultCollection.pageCount);
    console.log(model);

    if (startIndex > 0) {
      resultCollection.previous = {
        page: page - 1,
        limit: limit,
      };
    }

    if (endIndex <= model.length) {
      resultCollection.next = {
        page: page + 1,
        limit: limit,
      };
    }

    try {
      const userId = req.user.userId; // Extract userId from authenticated token
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

app.get("/collection/:id", authenticatetoken, async (req, res) => {
  const userId = req.user._id; // Extract userId from authenticated token
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

app.listen(port);
