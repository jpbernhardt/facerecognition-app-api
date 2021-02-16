const express = require("express");
const bcrypt = require("bcrypt-nodejs");
const cors = require("cors");

const app = express();

const database = {
  users: [
    {
      id: "1",
      name: "John",
      password: "abc",
      email: "john@gmail.com",
      entries: 0,
      joined: new Date(),
    },
    {
      id: "2",
      name: "Anna",
      password: "horse",
      email: "anna_95@gmail.com",
      entries: 0,
      joined: new Date(),
    },
  ],
};

app.use(express.json());
app.use(cors());

function getUserId(req) {
  return req.params.id;
}

app.get("/", (req, res) => {
  res.send(database.users);
});

app.post("/signin", (req, res) => {
  if (
    req.body.email === database.users[0].email &&
    req.body.password === database.users[0].password
  ) {
    res.json(database.users[0]);
  } else {
    res.status(400).json("Wrong login information");
  }
});

app.post("/register", (req, res) => {
  const { email, name } = req.body;
  database.users.push({
    id: "3",
    name: name,
    email: email,
    entries: 0,
    joined: new Date(),
  });
  res.json(database.users[database.users.length - 1]);
});

app.get("/profile/:id", (req, res) => {
  //const { id } = req.params;
  let found = false;
  database.users.forEach((user) => {
    if (user.id === getUserId(req)) {
      found = true;
      return res.json(user);
    }
  });
  if (!found) {
    res.status(400).json("User not found");
  }
});

app.put("/image", (req, res) => {
  const { id } = req.body;
  let found = false;
  database.users.forEach((user) => {
    if (user.id === id) {
      found = true;
      user.entries++;
      return res.json(user.entries);
    }
  });
  if (!found) {
    res.status(400).json("User not found");
  }
});

app.listen(3000, () => {
  console.log("Server is running on Port 3000");
});

/*
  /root -> res = this is working.
  /signin -> POST req = success or fail.
  /register -> POST req = user
  /profile/:userId -> GET req = user
  /image -> PUT req = user (update)
*/
