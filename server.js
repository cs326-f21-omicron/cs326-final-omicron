'use strict';

const PORT = process.env.PORT || 8080;

import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import http from 'http';
import { MongoClient, ObjectId } from 'mongodb';
import { Passport } from 'passport';
import { Strategy } from 'passport-local';
import { Server as SocketServer } from "socket.io";

const sessionOption = {
  secret: process.env.SECRET || 'SECRET',
  resave: false,
  saveUninitialized: false,
};

const app = express();
const server = http.createServer(app);
const io = new SocketServer(server);

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
const uri =
  process.env.MONGODB_URI ||
  `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_URL}/${process.env.MONGODB_DATABASE}?retryWrites=true&w=majority`;

const mongoClient = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// socket.io
io.on('connection', async socket => {
  // when user connects
  console.log(`${socket.id} connected`);

  // connect user to all rooms
  socket.on('join', async ({ userId }) => {
    const data = await mongoClient.db().collection('users').findOne({
      _id: ObjectId(userId)
    });
    data.rooms?.forEach(room => socket.join(room.toString()));
  });

  // when user disconnects
  socket.on('disconnect', () => {
    console.log(`${socket.id} disconnected`);
  });
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
    const database = mongoClient.db();
    const userData = database.collection('userData');
    const user = await userData.find({ username, password }).toArray();

    if (user && user.length > 0) {
      return done(null, user[0]);
    } else {
      return done(null, false, { message: 'Incorrect username or password' });
    }
  } catch (err) {
    return done(null, false, err);
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
      const database = mongoClient.db();
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

app.get('/suggestion', async (req, res) => {
  if (req.isAuthenticated()) {
    if (req.query.category) {
      try {
        const categoryID = req.query.category;
        const database = mongoClient.db();
        const postData = database.collection('posts');
        const categoryData = database.collection('categories');
        const categoryInfo = await categoryData
          .find({ _id: ObjectId(categoryID) })
          .toArray();
        const data = [];
        data.push(categoryInfo[0]);
        const posts = await postData
          .find({ 'category.$id': categoryID })
          .toArray();
        data[0].posts = posts;
        res.status(200).send(data);
      } catch (err) {
        console.log(err);
        res.status(400).send({ message: err.message });
      }
    } else {
      try {
        const database = mongoClient.db();
        const postData = database.collection('posts');
        const categoryData = database.collection('categories');
        const userCategories = req.user.categories;

        const data = [];

        for (let i = 0; i < userCategories.length; i++) {
          const categoryInfo = await categoryData
            .find({ _id: ObjectId(userCategories[i].$id) })
            .toArray();
          data.push(categoryInfo[0]);
          const postList = await postData
            .find({ 'category.$id': userCategories[i].$id })
            .limit(3)
            .toArray();
          data[i].posts = postList;
        }

        res.status(200).send(data);
      } catch (err) {
        res.status(400).send({ message: err.message });
      }
    }
  } else {
    res.status(400).send({ message: 'You are not logged in' });
  }
});

app.get('/newpost', (req, res) => {
  if (req.isAuthenticated()) {
    res.sendFile('home.html', { root: './html' });
  } else {
    res.redirect('/login');
  }
});

app.post('/newpost', async (req, res) => {
  if (req.isAuthenticated()) {
    const { title, description, location, image, category } = req.body;
    if (!description || !title || !location || !image) {
      res
        .status(400)
        .send({ message: 'Missing title, description, location, or image' });
      return;
    }

    try {
      const database = mongoClient.db();
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
        category: {
          $ref: 'categories',
          $id: category,
          $db: 'cs326_omicron',
        },
      };
      await posts.insertOne(data);
      res.status(200).send({ message: 'Post successful' });
    } catch (err) {
      res.status(400).send(err.message);
      return;
    }
  } else {
    res.status(400).send({ message: 'Not logged in' });
  }
});

app.get('/categories', async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      const database = mongoClient.db();
      const categories = database.collection('categories');
      const data = await categories.find().toArray();
      res.status(200).send(data);
    } catch (err) {
      res.status(400).send(err.message);
      return;
    }
  } else {
    res.status(400).send({ message: 'Not logged in' });
  }
});

app.get('/posts', async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      const database = mongoClient.db();
      const posts = database.collection('posts');
      const category = req.query.category;
      const id = req.query.id;
      if (category) {
        const data = await posts
          .find({
            category: {
              $ref: 'categories',
              $id: category,
              $db: 'cs326_omicron',
            },
          })
          .toArray();
        res.status(200).send(data);
      } else if (id) {
        const data = await posts
          .find({
            _id: ObjectId(id),
          })
          .toArray();
        const userData = database.collection('userData');
        const tmp = data[0].user;
        const userId = JSON.stringify(tmp).split('"')[7];
        const user = await userData.find({ _id: ObjectId(userId) }).toArray();
        data[0].user = user[0];
        res.status(200).send(data);
      } else {
        const data = await posts.find().toArray();
        res.status(200).send(data);
      }
    } catch (err) {
      res.status(400).send(err.message);
    }
  } else {
    res.status(400).send({ message: 'Not logged in' });
  }
});

app.get('/view', async (req, res) => {
  if (req.isAuthenticated()) {
    res.sendFile('view.html', { root: './html' });
  } else {
    res.redirect('/login');
  }
});


// Messaging

app.post('/rooms', async (req, res) => {
  const { name, type } = req.body;

  // set up data
  const room = {
    name,
    type,
    messages: [],
    users: []
  };

  try {
    // add room to collection
    await mongoClient.db().collection("rooms").insertOne(room);

    // return result
    res.end(JSON.stringify(room ?? {}));
  }
  catch (err) {
    console.log(err);
    res.status(500).end(JSON.stringify({}));
  }
});

app.get('/rooms/:roomId', async (req, res) => {
  const { roomId } = req.params;
  // const { userId } = req.body;

  try {
    // find one room
    const room = await mongoClient.db().collection('rooms').findOne({
      _id: ObjectId(roomId),
      // users: ObjectId(userId)
    });

    // return result
    res.end(JSON.stringify(room ?? {}));
  }
  catch (err) {
    console.log(err);
    res.status(500).end(JSON.stringify({}));
  }
});

app.get('/rooms/:roomId/messages', async (req, res) => {
  const { roomId } = req.params;

  try {
    // find one room
    const room = await mongoClient.db().collection('rooms').findOne({
      _id: ObjectId(roomId)
    });

    // populate messages
    const messages = room.messages ? await mongoClient.db().collection('messages').find({
      _id: { $in: room.messages }
    }).toArray() : [];

    // add user's display name to messages
    for (const message of messages) {
      const user = await mongoClient.db().collection('users').findOne({
        _id: message.user
      });
      message.userDisplayName = user ? user.name : "Unknown user";
    }

    res.end(JSON.stringify(messages ?? []));
  }
  catch (err) {
    console.log(err);
    res.status(500).end(JSON.stringify({}));
  }
});

app.post('/messages', async (req, res) => {
  const { content, userId, roomId } = req.body;

  const message = {
    content,
    user: ObjectId(userId),
    room: ObjectId(roomId),
    createdAt: Date.now(),
  };

  try {
    // insert message
    await mongoClient.db().collection('messages').insertOne(message);

    // update room
    await mongoClient.db().collection('rooms').updateOne(
      { _id: ObjectId(roomId) },
      {
        $push: { messages: message._id },
        $set: { lastMessage: message._id }
      }
    );

    // get user's display name
    const user = await mongoClient.db().collection('users').findOne({
      _id: message.user
    });
    message.userDisplayName = user ? user.name : "Unknown user";

    // send update message
    io.to(roomId).emit('message', JSON.stringify(message));

    // return message data
    res.end(JSON.stringify(message ?? {}));
  }
  catch (err) {
    console.log(err);
    res.status(500).end(JSON.stringify({}));
  }
});

app.post('/rooms/:roomId/users', async (req, res) => {
  const { roomId } = req.params;
  const { userId } = req.body;

  try {
    // Add user to room
    await mongoClient.db().collection('rooms').updateOne({
      _id: ObjectId(roomId)
    }, {
      $push: { users: ObjectId(userId) }
    });

    // Add room to user
    await mongoClient.db().collection('users').updateOne({
      _id: ObjectId(userId)
    }, {
      $push: { rooms: ObjectId(roomId) }
    });

    res.end(JSON.stringify({}));
  }
  catch (err) {
    console.log(err);
    res.status(500).end(JSON.stringify({}));
  }
});

app.delete('/rooms/:roomId/users', async (req, res) => {
  const { roomId } = req.params;
  const { userId } = req.body;

  try {
    // Remove user from room
    await mongoClient.db().collection('rooms').updateOne({
      _id: ObjectId(roomId)
    }, {
      $pull: { users: ObjectId(userId) }
    });

    // Remove room from user
    await mongoClient.db().collection('users').updateOne({
      _id: ObjectId(userId)
    }, {
      $pull: { rooms: ObjectId(roomId) }
    });

    res.end(JSON.stringify({}));
  }
  catch (err) {
    console.log(err);
    res.status(500).end(JSON.stringify({}));
  }
});

// Main

const main = async () => {
  await mongoClient.connect();
  console.log('connected to mongodb');

  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
};

main();