import bodyParser from 'body-parser';
import cors from 'cors';
import { formatDistanceToNowStrict } from 'date-fns';
import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import http from 'http';
import { MongoClient, ObjectId } from 'mongodb';
import { Passport } from 'passport';
import { Strategy } from 'passport-local';
import { Server as SocketServer } from "socket.io";


// this is to load the env file on local environment

dotenv.config();


// Config

const PORT = process.env.PORT || 8080;

const bodyParserOption = {
  extended: true,
  parameterLimit: 100000,
  limit: '50mb',
};

const sessionOption = {
  secret: process.env.SECRET || 'SECRETTTTTT',
  resave: false,
  saveUninitialized: false,
};


// Database connection

const uri =
  process.env.MONGODB_URI ||
  `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_URL}/${process.env.MONGODB_DATABASE}?retryWrites=true&w=majority`;

const mongoClient = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Express

const app = express();
const server = http.createServer(app);
const io = new SocketServer(server);


// Socket.io

io.on('connection', async socket => {
  // when user connects
  console.log(`${socket.id} connected`);

  // connect user to all rooms
  socket.on('join', async ({ userId }) => {
    console.log(`User ${userId} connected`);
    // const data = await mongoClient.db().collection('users').findOne({
    //   _id: ObjectId(userId)
    // });
    // data?.rooms?.forEach(room => socket.join(room.toString()));
  });

  // when user disconnects
  socket.on('disconnect', () => {
    console.log(`${socket.id} disconnected`);
  });
});


// Express

app.use('/images', express.static('images'));
app.use('/css', express.static('css'));
app.use('/js', express.static('js'));

app.use(cors());
app.use(bodyParser.json(bodyParserOption));
app.use(session(sessionOption));


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
    const user = await mongoClient.db().collection('users').findOne({
      username,
      password
    });

    if (user) {
      return done(null, user);
    } else {
      return done(null, false, {
        message: 'Incorrect username or password'
      });
    }
  } catch (err) {
    return done(null, false, {
      message: 'Error'
    });
  }
});

passport.use(strategy);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (userId, done) => {
  const user = await mongoClient.db().collection('users').findOne({
    _id: ObjectId(userId)
  });
  // just to be really safe
  delete user.password;
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

  // input validation
  if (!username || !password) {
    res.status(400).send({ message: 'Missing username or password' });
    return;
  }

  // add user
  try {
    const users = mongoClient.db().collection('users');

    // check if username already exists
    const user = await users.findOne({ username });
    if (user) {
      res.status(400).send({ message: 'Username already exists' });
      return;
    }

    // add user to database
    await users.insertOne({ username, password });

    res.send({
      message: 'Signup successful'
    });
  } catch (err) {
    console.log(err);
    res.status(400).send({
      message: "Error"
    });
  }
});

// Logout

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

// Suggestions

app.get('/suggestion', async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      const data = [];

      if (req.query.category) {
        const categoryID = req.query.category;

        const category = await mongoClient.db().collection('categories')
          .findOne({ _id: ObjectId(categoryID) });
        const posts = await mongoClient.db().collection('posts')
          .find({ 'category.$id': categoryID })
          .toArray();
        category.posts = posts;
        data.push(category);
      } else {
        const userCategories = req.user.categories ?? [];

        for (let i = 0; i < userCategories.length; i++) {
          const category = await mongoClient.db().collection('categories')
            .findOne({ _id: ObjectId(userCategories[i].$id) });
          const posts = await mongoClient.db().collection('posts')
            .find({ 'category.$id': userCategories[i].$id })
            .limit(3)
            .toArray();
          category.posts = posts;
          data.push(category);
        }
      }

      res.status(200).send(data);
    } catch (err) {
      res.status(400).send({ message: err.message });
    }
  } else {
    res.status(401).send({ message: 'You are not logged in' });
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
          $db: process.env.MONGODB_DATABASE,
        },
        category: {
          $ref: 'categories',
          $id: category,
          $db: process.env.MONGODB_DATABASE,
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
              $db: process.env.MONGODB_DATABASE,
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
        const users = database.collection('users');
        const tmp = data[0].user;
        const userId = JSON.stringify(tmp).split('"')[7];
        const user = await users.find({ _id: ObjectId(userId) }).toArray();
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

// GET Messages page
app.get('/messages', async (req, res) => {
  if (req.isAuthenticated()) {
    res.sendFile('messages.html', { root: './html' });
  } else {
    res.redirect('/login');
  }
});


app.get('/newmessages', async (req, res) => {
  if (req.isAuthenticated()) {
    res.sendFile('newmessages.html', { root: './html' });
  } else {
    res.redirect('/login');
  }
});

// POST Create new room
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
    res.send(room ?? {});
  }
  catch (err) {
    console.log(err);
    res.status(500).send({
      message: "Error"
    });
  }
});

// GET room info
app.get('/rooms/:roomId', async (req, res) => {
  const { roomId } = req.params;

  try {
    // find one room
    const room = await mongoClient.db().collection('rooms').findOne({
      _id: ObjectId(roomId),
    });

    // return result
    res.send(room ?? {});
  }
  catch (err) {
    console.log(err);
    res.status(500).send({
      message: "Error"
    });
  }
});


app.get('/rooms/:roomId/details', async (req, res) => {
  const { roomId } = req.params;

  try {
    // find one room
    const room = await mongoClient.db().collection('rooms').findOne({
      _id: ObjectId(roomId),
    });

    // populate lastMessage
    if (room.lastMessage) {
      room.lastMessage = await mongoClient.db().collection('messages').findOne({
        _id: room.lastMessage
      });

      // get user's name
      const user = await mongoClient.db().collection('users').findOne({
        _id: room.lastMessage.user
      });
      room.lastMessage.userName = user.name ? user.name : "Unknown user";

      // get time difference
      room.lastMessage.timeDifference = formatDistanceToNowStrict(room.lastMessage.createdAt);
    }

    // return result
    res.send(room ?? {});
  }
  catch (err) {
    console.log(err);
    res.status(500).send({
      message: "Error"
    });
  }
});

// GET room messages
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

    res.send(messages ?? []);
  }
  catch (err) {
    console.log(err);
    res.status(500).send({
      message: "Error"
    });
  }
});

// POST new message
app.post('/rooms/:roomId/message', async (req, res) => {
  const { roomId } = req.params;
  const { content, userId } = req.body;

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
    res.send(message ?? {});
  }
  catch (err) {
    console.log(err);
    res.status(500).send({
      message: "Error"
    });
  }
});

// POST add user to room
app.post('/rooms/:roomId/user', async (req, res) => {
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

    res.send({});
  }
  catch (err) {
    console.log(err);
    res.status(500).send({
      message: "Error"
    });
  }
});

// DELETE user from room
app.delete('/rooms/:roomId/user', async (req, res) => {
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

    res.send({});
  }
  catch (err) {
    console.log(err);
    res.status(500).send({
      message: "Error"
    });
  }
});

// Get info of current user
app.get('/currentUser', async (req, res) => {
  res.send(req.user);
});

// Main

const main = async () => {
  await mongoClient.connect();
  console.log('Connected to database');

  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
};

main();