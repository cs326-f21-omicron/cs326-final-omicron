import bodyParser from 'body-parser';
import { info } from 'console';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import http from 'http';
import { MongoClient, ObjectId } from 'mongodb';
import { Passport } from 'passport';
import { Strategy } from 'passport-local';
import { Server as SocketServer } from "socket.io";
dotenv.config();


// Config

const PORT = process.env.PORT || 8000;

const sessionOption = {
  secret: process.env.SECRET || 'SECRET',
  resave: false,
  saveUninitialized: false,
};
let da;


// Database connection

const uri =
  process.env.MONGODB_URI ||
  `mongodb://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_URL}/${process.env.MONGODB_DATABASE}?retryWrites=true&w=majority`;


const url = "mongodb://localhost:27017";
const mongoClient = new MongoClient(url);

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
    const data = await mongoClient.db().collection('users').findOne({
      _id: ObjectId(userId)
    });
    data?.rooms?.forEach(room => socket.join(room.toString()));
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
app.use(
  bodyParser.json({
    extended: true,
    parameterLimit: 100000,
    limit: '50mb',
  })
);
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
        const userCategories = req.user.categories ?? [];

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

app.get('/messages', async (req, res) => {
  // if (req.isAuthenticated()) {
  res.sendFile('messages.html', { root: './html' });
  // } else {
  //   res.redirect('/login');
  // }
});


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
    res.end(room ?? {});
  }
  catch (err) {
    console.log(err);
    res.status(500).send({
      message: "Error"
    });
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

    res.send(messages ?? []);
  }
  catch (err) {
    console.log(err);
    res.status(500).send({
      message: "Error"
    });
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
    res.send(message ?? {});
  }
  catch (err) {
    console.log(err);
    res.status(500).send({
      message: "Error"
    });
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

    res.send({});
  }
  catch (err) {
    console.log(err);
    res.status(500).send({
      message: "Error"
    });
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

    res.send({});
  }
  catch (err) {
    console.log(err);
    res.status(500).send({
      message: "Error"
    });
  }
});

app.get('/profile', (req, res) => {
    res.sendFile('profile.html', { root: './html' });
});

app.get('/profile/:username', async (req, res) => {
    const email = req.params.username;
    const profiles = await mongoClient.db().collection('profiles');
    const profile = await profiles.findOne({
        id: email
    });
    let data;
    if(!profile) {
        data = {
            id: email,
            info:
                {Name: "Enter Name",
                Email: email}
            ,
            bio: "No biography provided",
            geo: 
                {City: 'No city provided',
                Area: 'No area provided'}
            ,
            hobbies: [],
            interests: []
        }
        profiles.insertOne(data);
    }
    else {
        data = profile;
    }
    res.send(JSON.stringify(data));
    res.end();
});

app.post('/profile/:userId/updateName', async (req, res) => {
    const userId = req.params.userId;
    const updatedName = req.body.name;
    const profiles = await mongoClient.db().collection('profiles');
    await profiles.updateOne({
        id: userId
    }, {
      $set: {"info.Name": updatedName}
    });
    const profile = await profiles.findOne({
      id: userId
    })
    res.send(JSON.stringify(profile));
    res.end();
});

app.post('/profile/:userId/updateBio', async (req, res) => {
    const userId = req.params.userId;
    const updatedBio = req.body.bio;
    const profiles = await mongoClient.db().collection('profiles');
    await profiles.updateOne({
      id: userId
    }, {
      $set: {"bio": updatedBio}
    });
    const profile = await profiles.findOne({
      id: userId
    })
    res.send(JSON.stringify(profile));
    res.end();
});

app.post('/profile/:userId/updateCity', async (req, res) => {
  const userId = req.params.userId;
  const updatedCity = req.body.city;
  const profiles = await mongoClient.db().collection("profiles");
  await profiles.updateOne({
    id: userId
  }, {
    $set: {"geo.City": updatedCity}
  });
  const profile = await profiles.findOne({
    id: userId
  })
  res.send(JSON.stringify(profile));
  res.end();
});

app.post('/profile/:userId/updateArea', async (req, res) => {
  const userId = req.params.userId;
  const updatedArea = req.body.area;
  const profiles = await mongoClient.db().collection("profiles");
  await profiles.updateOne({
    id: userId
  }, {
    $set: {"geo.Area": updatedArea}
  });
  const profile = await profiles.findOne({
    id: userId
  })
  res.send(JSON.stringify(profile));
  res.end();
});


app.post('/profile/:userId/updateHobbies', async (req, res) => {
    const userId = req.params.userId;
    const newHobby = req.body.hobby;
    const newScore = req.body.score;
    const profiles = mongoClient.db().collection("profiles");
    await profiles.updateOne({
        id: userId
    }, {
        $push: {"hobbies": {"hobby": newHobby, "score": newScore}}
    });
    const profile = await profiles.findOne({
      id: userId
    })
    res.send(JSON.stringify(profile));
    res.end();
});

app.delete('/profile/:userId/removeHobby', async (req, res) => {
  const userId = req.params.userId;
  const delHobby = req.body.hobby;
  const profiles = mongoClient.db().collection("profiles");
  await profiles.updateOne({
      id: userId
  }, {
      $pull: {"hobbies": {"hobby": delHobby}}
  });
  const profile = await profiles.findOne({
    id: userId
  })
  res.send(JSON.stringify(profile));
  res.end();
});

app.post('/profile/:userId/updateInterests', async (req, res) => {
  const userId = req.params.userId;
  const newInterest = req.body.interest;
  const newScore = req.body.score;
  const profiles = mongoClient.db().collection("profiles");
  await profiles.updateOne({
      id: userId
  }, {
      $push: {"interests": {"interest": newInterest, "score": newScore}}
  });
  const profile = await profiles.findOne({
    id: userId
  })
  res.send(JSON.stringify(profile));
  res.end();
});

app.delete('/profile/:userId/removeInterest', async (req, res) => {
const userId = req.params.userId;
const delInterest = req.body.interest;
const profiles = mongoClient.db().collection("profiles");
await profiles.updateOne({
    id: userId
}, {
    $pull: {"interests": {"interest": delInterest}}
});
const profile = await profiles.findOne({
  id: userId
})
res.send(JSON.stringify(profile));
res.end();
});

app.delete('/profile/:userId/resetProfile', async (req, res) => {
  const userId = req.params.userId;
  const profiles = mongoClient.db().collection("profiles");
  await profiles.deleteOne({
    id: userId
  });
  res.send({});
})


// Main

function main() {
    mongoClient.connect();
    console.log('Connected to database');

  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
};



main();

