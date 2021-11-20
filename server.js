'use strict';

const PORT = process.env.PORT || 8080;
// const expressSession = require('express-session');
// const express = require('express');
// const cor = require('cors');

import cors from 'cors';
import express from 'express';
import { addUser, findUser } from './Auth/database.js';
import * as messagesDatabase from './database/messages.js';
import { getData } from './Suggestion/database.js';
import { MongoClient } from 'mongodb';
import { Passport } from 'passport';
import { Strategy } from 'passport-local';
import session from 'express-session';

const app = express();
const sessionOption = {
  secret: process.env.SECRET || 'SECRET', // set this encryption key in Heroku config (never in GitHub)!
  resave: false,
  saveUninitialized: false,
};

app.use(express.json());
app.use(cors());

app.use('/images', express.static('images'));
app.use('/css', express.static('css'));
app.use('/js', express.static('js'));

// Database connection
const uri =
  'mongodb+srv://PfJ3mgeu2tfJX3VV:KoQUGpiHwuvBf8hR@cs326-final-omicron.3dn53.mongodb.net/cs326_omicron?retryWrites=true&w=majority';
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

    console.log(username, password, user);

    if (user) {
      return done(null, username);
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
  res.sendFile('landing.html', { root: './html' });
});

// Home

app.get('/home', (req, res) => {
  res.sendFile('home.html', { root: './html' });
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
  res.sendFile('login.html', { root: './html' });
});

app.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/register',
  })
);

// Signup

app.get('/signup', (req, res) => {
  res.sendFile('signup.html', { root: './html' });
});

app.post('/signup', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).send({ message: 'Missing username or password' });
  } else {
    if (addUser(username, password)) {
      res.status(200).send({ message: 'User created' });
    } else {
      res.status(400).send({ message: 'User already exists' });
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

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
