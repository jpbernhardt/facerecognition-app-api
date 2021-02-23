const express = require("express");
const bcrypt = require("bcrypt-nodejs");
const cors = require("cors");
const knex = require('knex');

const db = knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'jpbernhardt',
    password : '',
    database : 'facerecognitionDB'
  }
});

const app = express();

app.use(express.json());
app.use(cors());

function getUserId(req) {
  return req.params.id;
}

app.get("/", (req, res) => {
  res.send('Success');
});

app.post("/signin", (req, res) => {
  db.select('email', 'hash').from('login')
  .where('email', '=', req.body.email)
  .then(data => {
    const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
    if (isValid) {
      return db.select('*').from('users')
        .where('email', '=', req.body.email)
        .then(user => {
          res.json(user[0]);
        })
        .catch(err => res.status(400).json('Unable to get user'));
    } else {
      res.status(400).json('Wrong credentials');
    }
  })
  .catch(err => res.status(400).json('Wrong credentials'));
});

app.post("/register", (req, res) => {
  const { email, name, password } = req.body;
  const hash = bcrypt.hashSync(password);
    db.transaction(trx => {
      trx.insert({
        hash: hash,
        email: email
      })
      .into('login')
      .returning('email')
      .then(loginEmail => {
        return trx('users')
          .returning('*')
          .insert({
            email: loginEmail[0],
            name: name,
            joined: new Date()
          })
          .then(user => {
            res.json(user[0]);
          })
      })
      .then(trx.commit) // To commit the data if the promise is fullfilled.
      .catch(trx.rollback) // To rollback the data if the promise is rejected.
    })
    .catch(err => res.status(400).json('Unable to register'))
});

app.get("/profile/:id", (req, res) => {
  const { id } = req.params;
  db.select('*').from('users').where({
    id: id
  })
  .then(user => {
    if (user.length) {
      res.json(user[0])
    } else {
      res.status(400).json('Not Found!')
    }
  })
  .catch(err => res.status(400).json('Error getting the user!'));
});

app.put("/image", (req, res) => {
  const { id } = req.body;
  db('users').where('id', '=', id)
  .increment('entries', 1)
  .returning('entries')
  .then(entries => {
    res.json(entries[0]);
  })
  .catch(err => res.status(400).json('Unable to get entires'))
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
