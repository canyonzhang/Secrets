//jshint esversion:6
require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// const encrypt = require("mongoose-encryption");
// const md5 = require("md5"); //package for hashing passwords
const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();

app.use(express.static("public"));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));


mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});


const userSchema = new mongoose.Schema({
  email : String,
  password : String
});


// userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ['password'] }); //process.env.ENVIRONMENTVARNAME

const User = new mongoose.model("User", userSchema);


app.get("/", function(req, res){
  res.render("home");
});

app.get("/login", function(req, res){
  res.render("login");
});

app.get("/register", function(req, res){
  res.render("register");
});

app.get("/logout", function(req, res){
  res.redirect("login");
});

app.post("/register", function(req, res){
  const email = req.body.username;
  // const password = md5(req.body.password);
      bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
          // Store hash in your password DB.
          const newUser = new User({
            email : email,
            password: hash
          });
          newUser.save(function(err){
            if(!err){
              res.render("secrets", {username: email});
            }
            else{
              res.send("err " + err);
            }
          });
      });
});


app.post("/login", function(req, res){
  const username = req.body.username;
  const password = req.body.password;
  User.findOne({email: username}, function(err, foundUser){
    if (!err){
      if (foundUser){ //foundUser is a User object specified by our userSchema
        bcrypt.compare(password, foundUser.password, function(err, result) {
     if (result === true){
       res.render("secrets", {username: username});
     }
  });
      }
    }else{
      res.send(err);
      console.log(err);
    }
  });

})


app.listen(3000, function(req, res){
  console.log("Server started on port 3000");
})
