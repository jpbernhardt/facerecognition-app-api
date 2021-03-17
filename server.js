const express = require("express");
const bcrypt = require("bcrypt-nodejs");
const cors = require("cors");
const knex = require('knex');


const register = require('./controllers/register');
const signin = require('./controllers/signin');
const profile = require('./controllers/profile');
const image = require("./controllers/image");

process.

const db = knex({
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: true
  }
  // connection: {
  //   host : '127.0.0.1',
  //   user : 'jpbernhardt',
  //   password : '',
  //   database : process.env.DATABASE_URL
  // }
});

const app = express();

app.use(express.json());
app.use(cors());

function getUserId(req) {
  return req.params.id;
}

app.get("/", (req, res) => { res.send('db.database.user') });
app.get('/db', async (req, res) => {
  try {
    const client = await db.connect();
    const result = await client.query('SELECT * FROM test_table');
    console.log(result);
    const results = { 'results': (result) ? result.rows : null};
    res.render('pages/db', results );
    client.release();
  } catch (err) {
      console.error(err);
      res.send("Error " + err);
  }
})

app.post("/signin", (req, res) => { signin.handleSignin(req, res, db, bcrypt) });
app.post("/register", (req, res) => { register.handleRegister(req, res, db, bcrypt) });
app.get("/profile/:id", (req, res) => { profile.handleProfileGet(req, res, db) });
app.put("/image", (req, res) => { image.handleImage(req, res, db) });
app.post("/imageurl", (req, res) => { image.handleApiCall(req, res) });

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on Port ${process.env.PORT}`);
});