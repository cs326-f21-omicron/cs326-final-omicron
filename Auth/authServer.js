'use strict';

const PORT = 8080;

import express from 'express';
import cors from 'cors';
import { addUser, findUser } from './database.js';

const app = express();

app.use(express.json());
app.use(cors());

app.post('/signup', (req, res) => {
  console.log(req.body);
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

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('*', (req, res) => {
  // Try it...
  res.redirect('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
});

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});