const express = require('express');
const app = express();

app.use(express.json());

const port = 3000;

const basicInfo = {};
const bio = {};
const geo = {};
const hobbies = {};
const interests = {};

app.get('/', (req, res) => {
  res.send('Welcome back to your profile!')
});

app.get('/readInfo/:key', (req, res) => {
  const userID = req.params.id;
  const name = basicInfo[userID].name;
  const email = basicInfo[userID].email
  res.send(`Name = ${name}, email = ${email}`);
});

app.get('/read_Bio/:key', (req, res) => {
    const userID = req.query.id;
    const userBio = bio[userID].bio;
    res.send(`Length of bio paragraph =${bio}`);
});

app.get('/read_Geo/:key', (req, res) => {
    const userID = req.query.id;
    const city = geo[userID].city;
    const area = geo[userID].area
    res.send(`City = ${city}, area = ${area}`);
  });

  app.get('/read_Hobbies/:key', (req, res) => {
    const userID = req.query.id;
    const hobbies = hobbies[userID].hobbies;
    for(h in hobbies) {
        const name = h[0];
        const score = h[1];
        res.send(`Hobby Name = ${name}, score = ${score}`);
    }
  });

  app.get('/read_Interests/:key', (req, res) => {
    const userID = req.query.id;
    const intersts = interests[userID].interests;
    for(i in intersts) {
        const name = i[0];
        const score = i[1];
        res.send(`Interst Name = ${name}, score = ${score}`);
    }
  });

    app.post('/add_Hobby', (req, res) => {
    const userID = req.params.id;
    const hobby = req.params.hobby;
    const score = req.params.score;
    hobbies[userID].push([hobby, score]);
    res.send(`Added hobby ${hobby} with score ${score}`);
    });

    app.post('/add_Hobby', (req, res) => {
        const userID = req.params.id;
        const interest = req.params.hobby;
        const score = req.params.score;
        hobbies[userID].push([interest, score]);
        res.send(`Added interest ${hobby} with score ${score}`);
        });


app.listen(port, () => {
    
});