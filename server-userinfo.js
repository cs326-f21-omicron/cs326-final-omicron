'use strict';
const express = require('express');
const app = express();

app.use(express.json());

const port = 3000;

const userIDs = [];
const Info = {};
const Bio = {};
const Geo = {};
const Hobbies = {};
const Interests = {};

app.get('/', (req, res) => {
  res.send(JSON.stringify('Welcome back to your profile!'));
});

app.get('/users/:userID/createProfile', (req, res) => {
    const userID = req.params.userID;
    const name = req.query.name;
    const email = req.query.email;
    Info[userID] = {name: name, email: email};
    Bio[userID] = "No biography provided";
    Geo[userID] = {"city": 'No city provided', "area": 'No area provided'};
    Hobbies[userID] = {};
    Interests[userID] = {};
    userIDs.push(userID);
    res.send(JSON.stringify("Created Profile for user " + userID));
});

app.get('/users/:userID/readInfo', (req, res) => {
  const userID = req.params.userID;
  res.send(JSON.stringify(Info[userID]));
});

app.post('/users/:userID/updateEmail/:email', (req, res) => {
    const userID = req.params.userID;
    const email = req.params.email;
    Info[userID].email = email;
    res.send(JSON.stringify(Info[userID]));
});

app.post('/users/:userID/deleteEmail', (req, res) => {
    const userID = req.params.userID;
    Info[userID].email = "No email Provided";
    res.send(JSON.stringify(Info[userID]));
});

app.get('/users/:userID/readBio', (req, res) => {
    const userID = req.params.userID;
    const bio = Bio[userID].bio;
    res.send(JSON.stringify(Bio[userID]));
});

app.post('/users/:userID/updateBio', (req, res) => {
    const userID = req.params.userID;
    const bio = req.query.bio;
    Bio[userID].bio = bio;
    res.send(JSON.stringify(Bio[userID]));
});

app.get('users/:userID/readGeo', (req, res) => {
    const userID = req.params.userID;
    const city = Geo[userID].city;
    const area = Geo[userID].area;
    res.send(JSON.stringify(Geo[userID]));
});

app.post('users/:userID/updateGeo', (req, res) => {
    const userID = req.params.userID;
    const city = req.query.city;
    const area = req.query.area;
    Geo[userID].city = city;
    Geo[userID].area = area;
    res.send(JSON.stringify(Geo[userID]));
});

app.get('users/:userID/readHobbies', (req, res) => {
    const userID = req.params.userID;
    const hobbies = Hobbies[userID];
    res.send(JSON.stringify(hobbies));
});

app.get('users/:userID/updateHobbies', (req, res) => {
    const userID = req.params.userID;
    const hobby = req.query.hobby;
    const score = req.query.score;
    const hobbies = Hobbies[userID];
    hobbies[hobby] = score;
    res.send(JSON.stringify(Hobbies[userID]));
});

app.get('users/:userID/deleteHobby', (req, res) => {
    const userID = req.params.userID;
    const hobby = req.query.hobby;
    const hobbies = Hobbies[userID];
    delete hobbies[hobby];
    res.send(JSON.stringify(Hobbies[userID]));
});



app.listen(port, () => {
    
});

module.exports = {Info, Bio, Geo, Hobbies, Interests, userIDs};