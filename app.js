import express from "express";
import cors from "cors"; //unable all the requests which are coming from different different domain
import mongoose from "mongoose"; // to provide high level abstraction
import dotenv from "dotenv";

dotenv.config(); // load the environment variables from .env file
const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;

const app = express();
// const PORT = 9000;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded()); // middleware-> parse url-encoded data in submitting in req.body

mongoose.connect(
  MONGO_URL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  () => {
    console.log("MongoDb DB connected Successfully");
  }
);

//Create Mongoose Schema for user model
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

//create Mongoose model for User collection based on schema
const User = new mongoose.model("User", userSchema);

app.get("/", (req, res) => {
  res.send("Hello, Welcome to Registration and Login Backend");
});

//create a route for Login based on User

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  User.findOne({ email: email }, (err, user) => {
    if (user) {
      if (password === user.password) {
        res.send({ message: "Login Successfully", user: user });
      } else {
        res.send({ message: "Password is not matched" });
      }
    } else {
      res.send({ message: "User is not Found" });
    }
  });
});

//create a route for registration

app.post("/register", (req, res) => {
  const { name, email, password } = req.body;

  User.findOne({ email: email }, (err, user) => {
    if (user) {
      res.send({ message: "User Already Registered" });
    } else {
      //create a new user instance object with 3 details
      const user = new User({
        name: name,
        email: email,
        password: password,
      });
      user.save((err) => {
        if (err) {
          res.send(err);
        } else {
          res.send({ message: "User Registered Successfully" });
        }
      });
    }
  });
});

app.listen(PORT, () => {
  console.log(`App Started at port ${PORT}`);
});
