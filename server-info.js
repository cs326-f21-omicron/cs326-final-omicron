'use strict';

import express from 'express';

const app = express();

app.use(express.json());
app.use(express.static("Public"));
app.use(express.static("css"));
app.use(express.static("images"));

const port = 5500;

let database = {
    userIDs: [], Info: {}, Bio: {}, Geo: {}, Hobbies: {}, Interests: {}};


app.get('/', (req, res) => {
    res.end();
});

app.post('/users/:userID/createProfile', (req, res) => {
    const userID = req.params.userID;
    const name = req.body.name;
    const email = req.body.email;
    database.Info[userID] = {name: name, email: email};
    database.Bio[userID] = "No biography provided";
    database.Geo[userID] = {city: 'No city provided', area: 'No area provided'};
    database.Hobbies[userID] = {};
    database.Interests[userID] = {};
    database.userIDs.push(userID);
    res.send(JSON.stringify(database));
    res.end();
});

app.post('/users/:userID/updateName', (req, res) => {
    const userID = req.params.userID;
    const updatedName = req.body.name;
    database.Info[userID].name = updatedName;
    res.send(JSON.stringify(database));
    res.end();
});

app.post('/users/:userID/updateEmail', (req, res) => {
    const userID = req.params.userID;
    const updatedEmail = req.body.email;
    database.Info[userID].email = updatedEmail;
    res.send(JSON.stringify(database));
    res.end();
});

app.post('/users/:userID/deleteEmail', (req, res) => {
    const userID = req.params.userID;
    database.Info[userID].email = "No email Provided";
    res.send(JSON.stringify(database.Info));
    res.end();
});

app.get('/users/:userID/readInfo', (req, res) => {
    const userID = req.params.userID;
    res.send(JSON.stringify(database.Info[userID]));
    res.end();
  });

app.post('/users/:userID/updateBio', (req, res) => {
    const userID = req.params.userID;
    const updatedBio = req.body.bio;
    database.Bio[userID] = updatedBio;
    res.send(JSON.stringify(database));
    res.end();
});

app.get('/users/:userID/readBio', (req, res) => {
    const userID = req.params.userID;
    const bio = database.Bio[userID];
    res.send(JSON.stringify(bio));
    res.end();
});

app.post('/users/:userID/updateCity', (req, res) => {
    const userID = req.params.userID;
    const updatedCity = req.body.city;
    database.Geo[userID].city = updatedCity;
    res.send(JSON.stringify(database));
    res.end();
});

app.post('/users/:userID/updateArea', (req, res) => {
    const userID = req.params.userID;
    const updatedArea = req.body.area;
    database.Geo[userID].area = updatedArea;
    res.send(JSON.stringify(database));
    res.end();
});

app.get('/users/:userID/readGeo', (req, res) => {
    const userID = req.params.userID;
    const geo = database.Geo[userID];
    res.send(JSON.stringify(geo));
    res.end();
});

app.post('/users/:userID/updateHobbies', (req, res) => {
    const userID = req.params.userID;
    const newHobby = req.body.hobby;
    const newScore = req.body.score;
    const hobbies = database.Hobbies[userID];
    hobbies[newHobby] = newScore;
    res.send(JSON.stringify(database));
    res.end();
});

app.post('/users/:userID/deleteHobby', (req, res) => {
    const userID = req.params.userID;
    const delHobby = req.body.hobby;
    const hobbies = database.Hobbies[userID];
    delete hobbies[delHobby];
    res.send(JSON.stringify(database));
    res.end();
});

app.get('/users/:userID/readHobbies', (req, res) => {
    const userID = req.params.userID;
    const hobbies = database.Hobbies[userID];
    res.send(JSON.stringify(hobbies));
    res.end();
});

app.post('/users/:userID/updateInterests', (req, res) => {
    const userID = req.params.userID;
    const newInterest = req.body.interest;
    const newScore = req.body.score;
    const interests = database.Interests[userID];
    interests[newInterest] = newScore;
    res.send(JSON.stringify(database));
    res.end();
});

app.post('/users/:userID/deleteInterest', (req, res) => {
    const userID = req.params.userID;
    const delHobby = req.body.interest;
    const interests = database.Interests[userID];
    delete interests[delHobby];
    res.send(JSON.stringify(database));
    res.end();
});

app.get('/users/:userID/readInterests', (req, res) => {
    const userID = req.params.userID;
    const interests = database.Interests[userID];
    res.send(JSON.stringify(interests));
    res.end();
});

app.listen(port, () => {
});
