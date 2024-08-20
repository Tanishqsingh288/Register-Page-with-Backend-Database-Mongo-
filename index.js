const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");
const app = express();
const port = 5500;

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname)));

// Serve the HTML file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/index.html"));
});

// Database connection
mongoose
  .connect("mongodb://127.0.0.1:27017/Production")
  .then(() => {
    console.log("Connection successful");
  })
  .catch((err) => {
    console.log(err);
  });

// Mongoose Schema and Model
const userSchema = new mongoose.Schema({
  name: String,
  username: String,
  email: String,
  password: String,
});

const Users = mongoose.model("Users", userSchema);

// Handle user registration
app.post("/saveuser", async (req, res) => {
  const { name, username, email, password, confirmpassword } = req.body;

  try {
    // Check if username or email already exists
    const existingUser = await Users.findOne({ $or: [{ username }, { email }] });

    if (existingUser) {
      if (existingUser.username === username) {
        return res.send(`
          <script>
            alert('We already have a user with the same username. Please choose another username.');
            window.location.href = "/";
          </script>
        `);
      }
      if (existingUser.email === email) {
        return res.send(`
          <script>
            alert('We already have a user with the same email. Please choose another email.');
            window.location.href = "/";
          </script>
        `);
      }
    }

    // Check if passwords match
    if (password !== confirmpassword) {
      return res.send(`
        <script>
          alert("Passwords don't match. Please try again.");
          window.location.href = "/";
        </script>
      `);
    }

    // If no issues, create the new user
    const newUser = new Users({ name, username, email, password });
    await newUser.save();

    return res.send(`
      <script>
        alert("User registered successfully!");
        window.location.href = "/";
      </script>
    `);

  } catch (err) {
    console.log(err);
    return res.send(`
      <script>
        alert("Internal Server Error. Please try again later.");
        window.location.href = "/";
      </script>
    `);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
