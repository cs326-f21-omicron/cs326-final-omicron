'use strict';

const PORT = process.env.PORT || 8080;
// const expressSession = require('express-session');
// const express = require('express');
// const cor = require('cors');

import cors from 'cors';
import express from 'express';
import * as messagesDatabase from './database/messages.js';
import { getData } from './Suggestion/database.js';
import { MongoClient } from 'mongodb';
import { Passport } from 'passport';
import { Strategy } from 'passport-local';
import session from 'express-session';
import { DBSecret } from './DBSecret.js';
import bodyParser from 'body-parser';

const app = express();
const sessionOption = {
  secret: process.env.SECRET || 'SECRET', // set this encryption key in Heroku config (never in GitHub)!
  resave: false,
  saveUninitialized: false,
};

// app.use(express.json());
app.use(cors());
app.use(
  bodyParser.json({
    extended: true,
    parameterLimit: 100000,
    limit: '50mb',
  })
);

app.use('/images', express.static('images'));
app.use('/css', express.static('css'));
app.use('/js', express.static('js'));

// Database connection
const uri = `mongodb+srv://${DBSecret.username}:${DBSecret.password}@cs326-final-omicron.3dn53.mongodb.net/${DBSecret.database}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Authentication
const passport = new Passport();
const strategy = new Strategy(async (username, password, done) => {
  try {
    // Data validation
    if (username === '') {
      return done(null, false, { message: 'Username can not be null' });
    }

    if (password === '') {
      return done(null, false, { message: 'Password can not be null' });
    }

    // Find user in database
    await client.connect();
    const database = client.db('cs326_omicron');
    const userData = database.collection('userData');
    const user = await userData.find({ username, password }).toArray();

    if (user && user.length > 0) {
      return done(null, user[0]);
    } else {
      return done(null, false, { message: 'Incorrect username or password' });
    }
  } catch (err) {
    return done(null, false, err);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
});

app.use(session(sessionOption));
passport.use(strategy);
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

app.use(passport.initialize());
app.use(passport.session());

// Landing

app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect('/home');
  } else {
    res.sendFile('landing.html', { root: './html' });
  }
});

// Home

app.get('/home', (req, res) => {
  if (req.isAuthenticated()) {
    res.sendFile('home.html', { root: './html' });
  } else {
    res.redirect('/login');
  }
});

// Messaging

app.get('/messages', (req, res) => {
  res.sendFile('messages.html', { root: './html' });
});

app.get('/user/:userID/chatGroupsList', (req, res) => {
  const { userID } = req.params;
  const chatGroupsList =
    messagesDatabase.getChatGroupsInfoListFromUserID(userID);

  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(chatGroupsList));
});

app.get('/chatGroup/:chatGroupID', (req, res) => {
  const { chatGroupID } = req.params;
  const chatGroupInfo = messagesDatabase.getChatGroupInfo(chatGroupID);

  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(chatGroupInfo));
});

app.get('/chatGroup/:chatGroupID/messages', (req, res) => {
  const { chatGroupID } = req.params;
  const messages = messagesDatabase.getChatGroupMessages(chatGroupID);

  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(messages));
});

app.post('/chatGroup/:chatGroupID/messages/new', (req, res) => {
  const { chatGroupID } = req.params;
  const { authorID, text } = req.body;

  const data = messagesDatabase.newMessage(chatGroupID, authorID, text);

  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
});

// Login

app.get('/login', (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect('/home');
  } else {
    res.sendFile('login.html', { root: './html' });
  }
});

app.post('/login', passport.authenticate('local'), (req, res) => {
  res.redirect('/home');
});

// Signup

app.get('/signup', (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect('/home');
  } else {
    res.sendFile('signup.html', { root: './html' });
  }
});

app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).send({ message: 'Missing username or password' });
  } else {
    try {
      await client.connect();
      const database = client.db('cs326_omicron');
      const userData = database.collection('userData');
      if ((await userData.find({ username }).toArray().length) > 0) {
        res.status(400).send({ message: 'Username already exists' });
      } else {
        await userData.insertOne({ username, password });
        res.redirect('/signup');
        res.status(200).send({ message: 'Signup successful' });
      }
    } catch (err) {
      res.status(400).send({ message: err.message });
    }
  }
});

// Suggestions

app.get('/suggestion', (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    res.status(400).send('Missing userId');
    return;
  }

  res.status(200).send(getData(userId));
});

app.get('/newpost', (req, res) => {
  // if (req.isAuthenticated()) {
  //   res.sendFile('home.html', { root: './html' });
  // } else {
  //   res.redirect('/login');
  // }

  res.sendFile('newpost.html', { root: './html' });
});

app.post('/newpost', async (req, res) => {
  const { title, description, location, image } = req.body;
  if (!description || !title || !location || !image) {
    res
      .status(400)
      .send({ message: 'Missing title, description, location, or image' });
    return;
  }

  try {
    await client.connect();
    const database = client.db('cs326_omicron');
    const posts = database.collection('posts');
    const data = {
      title,
      description,
      location,
      image,
      date: new Date(),
      user: {
        $ref: 'userData',
        $id: req.user._id,
        $db: 'cs326_omicron',
      },
    };
    await posts.insertOne(data);
    res.status(200).send({ message: 'Post successful' });
  } catch (err) {
    res.status(400).send(err.message);
    return;
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
