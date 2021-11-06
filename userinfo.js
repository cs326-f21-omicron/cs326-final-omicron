import {Info, Bio, Geo, Hobbies, Interests, userIDs} from '../server-userinfo.js'

const userID = 'kjsmalley';
const name = 'Kirk Smalley';
const email = 'ksmalley@email.com';


function loadProfile() {
    if(!userIDs.contains(userID)) {
        const prom = await fetch('http://localhost:3000/users/'+userID+'/createProfile?'+'name='+name+'&'+'email='+email);
        const res = await prom.json();
        console.log(res);
    }
    document.getElementById("name-btn").addEventListener("click", updateName);
    document.getElementById("email-btn").addEventListener("click", updateEmail);
    document.getElementById('bio-btn').addEventListener("click", updateBio);
    document.getElementById('city-btn').addEventListener("click", updateCity);
    document.getElementById('area-btn').addEventListener("click", updateArea);
    document.getElementById('hobby-add-btn').addEventListener("click", addHobby);
    document.getElementById('hooby-remove-btn').addEventListener("click", removeHobby);
    document.getElementById('interest-add-btn').addEventListener("click", addInterest);
    document.getElementById('interest-remove-btn').addEventListener("click", removeInterest);
    renderProfile(userID);
}

function updateName() {
    const updatedName = document.getElementById("name-input").innerHTML;
    const prom = await fetch('http://localhost:3000/users/'+userID+'/updateInfo?'
                             +'name='+updatedName+'&'+'email='+Info[userID].email);
    const res = await prom.json();
    if(res.OK) {
        console.log("Updated Name");
    }
    renderProfile(userID);
}

function updateEmail() {
    const updatedEmail = document.getElementById("email-input").innerHTML;
    const prom = await fetch('http://localhost:3000/users/'+userID+'/updateInfo?'
                             +'name='+Info[userID].name+'&'+'email='+updatedEmail);
    const res = await prom.json();
    if(res.OK) {
        console.log("Updated Name");
    }
    renderProfile(userID);
}

function readInfo() {
    const prom = await fetch('http://localhost:3000/users/'+userID+'/readInfo');
    const res = await prom.json();
    if(res.OK) {
        return res;
    }
    else return -1;
}

function updateBio() {
    const updatedBio = document.getElementById("bio-input").innerHTML;
    const prom = await fetch('http://localhost:3000/users/'+userID+'/updateBio?'
                             +'bio='+updatedBio);
    const res = await prom.json();
    if(res.OK) {
        console.log("Updated Bio");
    }
    renderProfile(userID);
}

function addHobby() {
    const newHobby = document.getElementById("hobby-add-input").innerHTML.split(' ')[0];
    const newScore = document.getElementById("hobby-add-input").innerHTML.split(' ')[1];
    const prom = await fetch('http://localhost:3000/users/'+userID+'/updateHobbies?'
                             +'hobby='+newHobby+'&'+'score='+newScore);
    const res = await prom.json();
    if(res.OK) {
        console.log("Added " + newHobby + " with score " + newScore);
    }
    renderProfile(userID);
}

function removeHobby() {
    const delHobby = document.getElementById("hobby-remove-input").innerHTML;
    const prom = await fetch('http://localhost:3000/users/'+userID+'/deleteHobby?'
                             +'hobby='+delHobby);
    const res = await prom.json();
    if(res.OK) {
        console.log("Deleted hobby: " + delHobby);
    }
    renderProfile(userID);
}

function renderProfile(userID) {
    let nameDiv = document.getElementById("name");
    nameDiv.innerHTML = Info[userID].name;
    let emailDiv = document.getElementById("email");
    emailDiv.innerHTML = Info[userID].email;

    let bioDiv = document.getElementById("bio");
    bioDiv.innerHTML = Bio[userID];

    let cityDiv = document.getElementById("city");
    cityDiv.innerHTML = Geo[userID].city;
    let areaDiv = document.getElementById("area");
    areaDiv.innerHTML = Geo[userID].area;

    let InterestNameDiv = document.getElementById("interest-name");
    let InterestScoreDiv = document.getElementById("interest-score");
    let HobbyNameDiv = document.getElementById("hobby-name");
    let HobbyScoreDiv = document.getElementById("hobby-score");

    for(const [hobby, score] of Hobbies[userID]) {
        let currHobby = document.createElement("h4");
        let currScore = document.createElement("h4");
        currHobby.innerHTML = hobby;
        currScore.innerHTML = score;
        HobbyNameDiv.appendChild(currHobby);
        HobbyScoreDiv.appendChild(currScore);
    }
    for(const [interest, score] of Interests[userID]) {
        let currInterest = document.createElement("h4");
        let currScore = document.createElement("h4");
        currInterest.innerHTML = interest;
        currScore.innerHTML = score;
        InterestNameDiv.appendChild(currInterest);
        InterestScoreDiv.appendChild(currScore);
    }


}