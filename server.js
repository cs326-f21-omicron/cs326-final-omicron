'use strict';

const PORT = process.env.PORT || 8080;

import cors from 'cors';
import express from 'express';
import { addUser, findUser } from './Auth/database.js';
import * as messagesDatabase from './database/messages.js';
import { getData } from './Suggestion/database.js';

const app = express();

app.use(express.json());
app.use(cors());

app.use('/images', express.static('images'));
app.use('/css', express.static('css'));
app.use('/js', express.static('js'));

// Landing

app.get('/', (req, res) => {
  res.sendFile('landing.html', { root: './html' });
});

// Messaging

app.get('/messages', (req, res) => {
  res.sendFile('messages.html', { root: './html' });
});

app.get('/messages/:messageID', (req, res) => {
  res.sendFile('messages.html', { root: './html' });
});

app.get('/user/:userID/chatGroupsList', (req, res) => {
  const { userID: rawUserID } = req.params;
  const userID = parseInt(rawUserID);
  const chatGroupsList =
    messagesDatabase.getChatGroupsInfoListFromUserID(userID);

  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(chatGroupsList));
});

app.get('/chatGroup/:chatGroupID', (req, res) => {
  const { chatGroupID: rawChatGroupID } = req.params;
  const chatGroupID = parseInt(rawChatGroupID);
  const chatGroupInfo = messagesDatabase.getChatGroupInfo(chatGroupID);

  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(chatGroupInfo));
});

app.get('/chatGroup/:chatGroupID/messages', (req, res) => {
  const { chatGroupID: rawChatGroupID } = req.params;
  const chatGroupID = parseInt(rawChatGroupID);
  const messages = messagesDatabase.getChatGroupMessages(chatGroupID);

  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(messages));
app.get('/login', (req, res) => {
  res.sendFile('login.html', { root: './html' });
});

app.get('/signup', (req, res) => {
  res.sendFile('signup.html', { root: './html' });
});

app.get('/home', (req, res) => {
  res.sendFile('home.html', { root: './html' });
});

// Login

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).send({ message: 'Missing username or password' });
  } else {
    const user = findUser(username, password);
    if (user) {
      res.status(200).send({ message: 'User logged in', user });
    } else {
      res.status(400).send({ message: 'Invalid username or password' });
    }
  }
});

// Signup

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
