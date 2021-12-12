import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import http from 'http';
import { MongoClient, ObjectId } from 'mongodb';
import { Passport } from 'passport';
import { Strategy } from 'passport-local';
import { Server as SocketServer } from 'socket.io';

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

io.on('connection', async (socket) => {
  // connect user to room
  socket.on('join', async ({ roomId }) => {
    socket.join(roomId);
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
      password,
    });

    if (user) {
      return done(null, user);
    } else {
      return done(null, false, {
        message: 'Incorrect username or password',
      });
    }
  } catch (err) {
    return done(null, false, {
      message: 'Error',
    });
  }
});

passport.use(strategy);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (userId, done) => {
  const user = await mongoClient
    .db()
    .collection('users')
    .findOne({
      _id: ObjectId(userId),
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
  const { username, password, name } = req.body;

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
    await users.insertOne({ username, password, name });

    res.send({
      message: 'Signup successful',
    });
  } catch (err) {
    console.log(err);
    res.status(400).send({
      message: 'Error',
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

        if (categoryID.length === 24) {
          const category = await mongoClient
            .db()
            .collection('categories')
            .findOne({ _id: ObjectId(categoryID) });
          if (category === null) {
            res.status(400).send({ message: 'Category not found' });
            return;
          }
          const posts = await mongoClient
            .db()
            .collection('posts')
            .find({ 'category.$id': categoryID })
            .toArray();
          category.posts = posts;
          data.push(category);
        } else {
          res.status(400).send({ message: 'Invalid category ID' });
          return;
        }
      } else {
        const userCategories = req.user.categories ?? [];

        for (let i = 0; i < userCategories.length; i++) {
          const id = JSON.stringify(userCategories[i]).split('"')[7];
          const category = await mongoClient
            .db()
            .collection('categories')
            .findOne({ _id: ObjectId(id) });
          const posts = await mongoClient
            .db()
            .collection('posts')
            .find({ 'category.$id': id })
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
    res.sendFile('newpost.html', { root: './html' });
  } else {
    res.redirect('/login');
  }
});

app.post('/newpost', async (req, res) => {
  if (req.isAuthenticated()) {
    const { title, description, location, image, category } = req.body;
    if (!description || !title || !location || !image) {
      res.status(400).send({
        message: 'Missing title, description, location, or image',
      });
      return;
    }

    try {
      const postData = {
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
      await mongoClient.db().collection('posts').insertOne(postData);

      // when we create a new post, we also create a new chat room
      const roomData = {
        postId: postData._id,
        messages: [],
      };
      await mongoClient.db().collection('rooms').insertOne(roomData);

      res.status(200).send({ message: 'Post successful' });
    } catch (err) {
      res.status(400).send(err.message);
      return;
    }
  } else {
    res.status(400).send({ message: 'Not logged in' });
  }
});

app.get('/editpost', async (req, res) => {
  if (req.isAuthenticated()) {
    if (req.query.id && req.query.id.length === 24) {
      const id = req.query.id;
      const post = await mongoClient
        .db()
        .collection('posts')
        .findOne({
          _id: ObjectId(id),
        });
      if (
        post === null ||
        post === undefined ||
        post.length === 0 ||
        Object.keys(post).length === 0
      ) {
        res.redirect('/newpost');
        return;
      }

      const user = post.user;
      const userId = JSON.stringify(user).split('"')[7];
      if (req.user._id.toString() === userId.toString()) {
        res.sendFile('editpost.html', { root: './html' });
      } else {
        res.redirect('/newpost');
      }
    } else {
      res.redirect('/newpost');
    }
  } else {
    res.redirect('/login');
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
        const user = await users
          .find({ _id: ObjectId(userId) })
          .toArray();
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

app.put('/post', async (req, res) => {
  if (req.isAuthenticated()) {
    const { id, title, description, location, image, category } = req.body;
    if (!description || !title || !location || !image || !id) {
      res.status(400).send({
        message: 'Missing title, description, location, or image',
      });
      return;
    }
    if (id && id.length === 24) {
      const database = mongoClient.db();
      const posts = database.collection('posts');
      const data = await posts.findOne({
        _id: ObjectId(id),
      });
      if (data === null || data === undefined || data.length === 0) {
        res.status(400).send({ message: 'Post not found' });
        return;
      }
      const user = data.user;
      const userId = JSON.stringify(user).split('"')[7];
      if (req.user._id.toString() === userId.toString()) {
        const data = {
          title,
          description,
          location,
          image,
          date: new Date(),
          category: {
            $ref: 'categories',
            $id: category,
            $db: process.env.MONGODB_DATABASE,
          },
        };
        try {
          console.log('data', data);
          await posts.updateOne(
            { _id: ObjectId(id) },
            { $set: data }
          );
          res.status(200).send({ message: 'Post updated' });
        } catch (err) {
          res.status(400).send(err.message);
        }
      } else {
        res.status(400).send({ message: 'Not authorized' });
      }
    }
  } else {
    res.status(400).send({ message: 'Not logged in' });
  }
});

app.delete('/post', async (req, res) => {
  const { id } = req.body;

  if (req.isAuthenticated()) {
    if (id) {
      const postData = await mongoClient.db().collection('posts')
        .findOne({ _id: ObjectId(id) });
      if (!postData) {
        res.status(400).send({ message: 'Post not found' });
        return;
      }
      const user = postData.user;
      const userId = JSON.stringify(user).split('"')[7];
      if (req.user._id.toString() === userId.toString()) {
        // delete post
        await mongoClient.db().collection('posts')
          .deleteOne({ _id: postData._id });
        // delete room along with post
        await mongoClient.db().collection('rooms')
          .deleteOne({ postId: postData._id });
        res.status(200).send({ message: 'Post deleted' });
      } else {
        res.status(400).send({ message: 'Not authorized' });
      }
    } else {
      res.status(400).send({ message: 'Invalid id' });
    }
  } else {
    res.status(400).send({ message: 'Not logged in' });
  }
});

app.get('/post', async (req, res) => {
  if (req.isAuthenticated()) {
    res.sendFile('post.html', { root: './html' });
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

// POST Create a new room with post ID
app.post('/rooms', async (req, res) => {
  try {
    // check authenticated
    if (!req.isAuthenticated()) {
      return res.status(401).send({ message: 'Not logged in' });
    }

    // check postId exists
    const { postId } = req.body;
    if (!postId) {
      return res.status(400).send({ message: 'insufficient params' });
    }

    // check room existed for post
    const roomData = await mongoClient.db().collection('rooms').findOne({
      postId: ObjectId(postId)
    });
    if (roomData) {
      res.status(400).send({ message: 'Room existed for post' });
    }

    // add room to collection
    const room = {
      postId: ObjectId(postId),
      messages: [],
    };
    await mongoClient.db().collection('rooms').insertOne(room);

    // return result
    res.status(200).send({ message: 'Room created' });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Error' });
  }
});

// GET room info by id
app.get('/rooms/:roomId', async (req, res) => {
  try {
    // check authenticated
    if (!req.isAuthenticated()) {
      return res.status(401).send({ message: 'Not logged in' });
    }

    // check roomId exists
    const { roomId } = req.params;
    if (!roomId) {
      return res.status(400).send({ message: 'insufficient params' });
    }

    // find room
    const room = await mongoClient.db().collection('rooms')
      .findOne({ _id: ObjectId(roomId) });
    if (!room) {
      res.status(400).send({ message: 'Room does not exist' });
    }

    // populate post info
    room.post = await mongoClient.db().collection('posts')
      .findOne({ _id: ObjectId(room.postId) });
    if (!room.post) {
      res.status(400).send({ message: 'Post for this room does not exist' });
    }

    // return result
    res.status(200).send(room ?? {});
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Error' });
  }
});


// GET room info by postid
app.get('/posts/:postId/room', async (req, res) => {
  try {
    // check authenticated
    if (!req.isAuthenticated()) {
      return res.status(401).send({ message: 'Not logged in' });
    }

    // check postId exists
    const { postId } = req.params;
    if (!postId) {
      return res.status(400).send({ message: 'insufficient params' });
    }

    // find room
    let room = await mongoClient.db().collection('rooms')
      .findOne({ postId: ObjectId(postId) });

    // a little hack
    // if post is created and room is not, then create room
    if (!room) {
      room = {
        postId: ObjectId(postId),
        messages: [],
      };
      await mongoClient.db().collection('rooms').insertOne(room);
    }

    // populate post info
    room.post = await mongoClient.db().collection('posts')
      .findOne({ _id: ObjectId(room.postId) });
    if (!room.post) {
      res.status(400).send({ message: 'Post for this room does not exist' });
    }

    // return result
    res.status(200).send(room ?? {});
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Error' });
  }
});

// GET room messages
app.get('/rooms/:roomId/messages', async (req, res) => {
  try {
    // check authenticated
    if (!req.isAuthenticated()) {
      return res.status(401).send({ message: 'Not logged in' });
    }

    // check roomId exists
    const { roomId } = req.params;
    if (!roomId) {
      return res.status(400).send({ message: 'insufficient params' });
    }

    // find room
    const room = await mongoClient.db().collection('rooms')
      .findOne({ _id: ObjectId(roomId) });
    if (!room) {
      res.status(400).send({ message: 'Room does not exist' });
    }

    // populate messages
    const messages = room.messages
      ? await mongoClient.db().collection('messages')
        .find({ _id: { $in: room.messages } })
        .toArray()
      : [];

    // add user's display name to messages
    for (const m of messages) {
      const user = await mongoClient.db().collection('users').findOne({
        _id: m.user,
      });
      m.userDisplayName = user ? user.name : 'HobbShop user';
    }

    // return result
    res.status(200).send(messages ?? {});
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Error' });
  }
});

// POST new message
app.post('/rooms/:roomId/message', async (req, res) => {
  try {
    // check authenticated
    if (!req.isAuthenticated()) {
      return res.status(401).send({ message: 'Not logged in' });
    }

    // check all params existed
    const { roomId } = req.params;
    const { content, userId } = req.body;
    if (!(roomId && content && userId)) {
      return res.status(400).send({ message: 'insufficient params' });
    }

    // insert message
    const message = {
      content,
      user: ObjectId(userId),
      room: ObjectId(roomId),
      createdAt: Date.now(),
    };
    await mongoClient.db().collection('messages').insertOne(message);

    // Add message to room
    await mongoClient.db().collection('rooms').updateOne(
      { _id: ObjectId(roomId) },
      { $push: { messages: message._id } }
    );

    // get user's display name
    const user = await mongoClient.db().collection('users').findOne({
      _id: message.user,
    });
    message.userDisplayName = user ? user.name : 'HobbShop user';

    // broadcast message through socket.io
    io.to(roomId).emit('message', JSON.stringify(message));

    // return result
    res.status(200).send(message ?? {});
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Error' });
  }
});

// User info
app.get('/userInfo', async (req, res) => {
  const userInfo = req.user;
  res.send(userInfo);
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
