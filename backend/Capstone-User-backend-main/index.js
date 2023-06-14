const express = require('express')
const app =express()
const cors = require('cors')
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const userRouter = require('./router/router')
const { Client } = require('pg');
const bcrypt = require('bcrypt');
const db = require('./database/db.config')
require('dotenv').config()

db.connect((err) =>{
    if (err) {
        console.error(err);
        return;
    }
    console.log('Database Connected');
});

app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser(process.env.SECRET))
app.use(bodyParser.urlencoded({ extended: true}));
app.use(cors())

app.use('/', userRouter)
app.get('/', async (req, res) => {
  try {
    res.send(`Welcome Page`);
  } catch (error) {
    console.log(error);;
  }
});

PORT = process.env.PORT || 8080
app.listen(PORT, () => {
    console.log(`Application is running on ${PORT}!! `)})

module.exports = app;