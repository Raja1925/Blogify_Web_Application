// const express = require("express");
// const path = require("path");
// const ejs = require("ejs");
// const mangoose = require('mongoose');
// const cookieParser = require('cookie-parser');

// const Blog = require('./models/blog');

// const userRoute = require("./routes/user");
// const blogRoute = require("./routes/blog");
// const { default: mongoose } = require("mongoose");
// const { checkForAuthenticationCookie, authenticate } = require("./middlewares/authentication");

// const app = express();
// const PORT = 8000;

// mongoose.connect('mongodb://localhost:27017/blog')
//   .then(() => console.log("MongoDB connected!"))
//   .catch(err => console.error("MongoDB connection error:", err));


// app.set("view engine", "ejs");
// app.set("views", path.resolve("./views"));

// app.use(express.urlencoded({ extended: false }))
// app.use(cookieParser());
// app.use(checkForAuthenticationCookie('token'));
// app.use(express.static(path.resolve('./public')));

// app.get("/", async (req, res) => {
//   const allBlogs = await Blog.find({}).sort({createdAt: -1});
//   res.render('home', {
//     user: req.user,
//     blogs: allBlogs,
//   });
// });

// app.use('/user', userRoute);
// app.use('/blog', blogRoute);
// app.use('/api', blogRoute);

// app.listen(PORT, () => console.log("Server started at port: ", PORT));


const express = require("express");
const path = require("path");
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

const Blog = require('./models/blog');
const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");
const { checkForAuthenticationCookie, authenticate } = require("./middlewares/authentication"); // Import authenticate here

const app = express();
const PORT = process.env.PORT || 8000;

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/blog', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected!"))
  .catch(err => console.error("MongoDB connection error:", err));

// Set view engine and views directory
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

// Middleware setup
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForAuthenticationCookie('token')); // Ensure this matches how you set the cookie
app.use(express.static(path.resolve('./public')));

// Home route
app.get("/", async (req, res) => {
  try {
    const allBlogs = await Blog.find({}).sort({ createdAt: -1 });
    res.render('home', {
      user: req.user,
      blogs: allBlogs,
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Route definitions
app.use('/user', userRoute);
app.use('/blog', blogRoute);
app.use('/api', blogRoute); // Be careful with overlapping routes

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Start server
app.listen(PORT, () => console.log(`Server started at port: ${PORT}`));
