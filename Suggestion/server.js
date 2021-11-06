'use strict';

const PORT = 8080;

import express from 'express';
import cors from 'cors';
import { getData } from './database.js';

const app = express();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/suggestion', (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    res.status(400).send('Missing userId');
    return;
  }

  res.status(200).send(getData(userId));
});

app.get('*', (req, res) => {
  // Try it...
  res.redirect('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
});

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
