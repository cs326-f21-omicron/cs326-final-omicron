'use strict';

document.getElementById("name-btn").addEventListener("click", updateName);
document.getElementById("email-btn").addEventListener("click", updateEmail);
document.getElementById('bio-btn').addEventListener("click", updateBio);
document.getElementById('city-btn').addEventListener("click", updateCity);
document.getElementById('area-btn').addEventListener("click", updateArea);
document.getElementById('hobby-add-btn').addEventListener("click", addHobby);
document.getElementById('hobby-remove-btn').addEventListener("click", removeHobby);
document.getElementById('interest-add-btn').addEventListener("click", addInterest);
document.getElementById('interest-remove-btn').addEventListener("click", removeInterest);


const UserID = 'kjsmalley';
const Name = 'Kirk Smalley';
const Email = 'ksmalley@email.com';

loadProfile(UserID, Name, Email);


async function loadProfile(newID, newName, newEmail) {
    const prom = await fetch(`/users/${newID}/createProfile`, 
    {headers: {
        'Content-Type': 'application/json;charset=utf-8'
        },        
    method: "POST",
    body: JSON.stringify({name: newName, email: newEmail})
    });
    const database = await prom.json();
    if (database.OK) {
        console.log(`New Profile for ${newID} created`);
    }
    renderProfile(newID, database);
}

async function updateName() {
    const updatedName = document.getElementById("name-input").value;
    const prom = await fetch(`/users/${UserID}/updateName`, 
        {headers: {
            'Content-Type': 'application/json;charset=utf-8'
            }, 
        method: "POST",
        body: JSON.stringify({name: updatedName})
    });
    const database = await prom.json();
    if(database.OK) {
        console.log("Updated Name");
    }
    renderProfile(UserID, database);
}

async function updateEmail() {
    const updatedEmail = document.getElementById("email-input").value;
    const prom = await fetch(`/users/${UserID}/updateEmail`,
    {headers: {
        'Content-Type': 'application/json;charset=utf-8'
        }, 
    method: "POST",
    body: JSON.stringify({email: updatedEmail})
    });
    const database = await prom.json();
    if(database.OK) {
        console.log("Updated Email");
    }
    renderProfile(UserID, database);
}

async function readInfo() {
    const prom = await fetch(`/users/${UserID}/readInfo`,
    {headers: {
        'Content-Type': 'application/json;charset=utf-8'
        }, 
    method: "GET"
    });
    const info = await prom.json();
    if(info.OK) {
        return JSON.parse(info);
    }
    else return -1;
}

async function updateBio() {
    const updatedBio = document.getElementById("bio-input").value;
    const prom = await fetch('/users/'+UserID+'/updateBio',
    {headers: {
        'Content-Type': 'application/json;charset=utf-8'
        }, 
    method: "POST",
    body: JSON.stringify({bio: updatedBio})
    });
    const database = await prom.json();
    if(database.OK) {
        console.log("Updated Bio");
    }
    renderProfile(UserID, database);
}

async function readBio() {
    const prom = await fetch('/users/'+UserID+'/readBio',
    {headers: {
        'Content-Type': 'application/json;charset=utf-8'
        }, 
    method: "GET",
    });
    const bio = await prom.json();
    if(bio.OK) {
        return JSON.parse(bio);
    }
    else return -1;
}

async function updateCity() {
    const updatedCity = document.getElementById("city-input").value;
    const prom = await fetch('/users/'+UserID+'/updateCity',
    {headers: {
        'Content-Type': 'application/json;charset=utf-8'
        }, 
    method: "POST",
    body: JSON.stringify({city: updatedCity})
    });
    const database = await prom.json();
    if(database.OK) {
        console.log("Updated City");
    }
    renderProfile(UserID, database);
}

async function updateArea() {
    const updatedArea = document.getElementById("area-input").value;
    const prom = await fetch('/users/'+UserID+'/updateArea',
    {headers: {
        'Content-Type': 'application/json;charset=utf-8'
        }, 
    method: "POST",
    body: JSON.stringify({area: updatedArea})
    });
    const database = await prom.json();
    if(database.OK) {
        console.log("Updated Area");
    }
    renderProfile(UserID, database);
}

async function addHobby() {
    const newHobby = document.getElementById("hobby-add-input").value.split(' ')[0];
    const newScore = document.getElementById("hobby-add-input").value.split(' ')[1];
    const prom = await fetch('/users/'+UserID+'/updateHobbies',
    {headers: {
        'Content-Type': 'application/json;charset=utf-8'
        }, 
    method: "POST",
    body: JSON.stringify({hobby: newHobby, score: newScore})
    });           
    const database = await prom.json();
    if(database.OK) {
        console.log("Added " + newHobby + " with score " + newScore);
    }
    renderProfile(UserID, database);
}

async function removeHobby() {
    const delHobby = document.getElementById("hobby-remove-input").value;
    const prom = await fetch('/users/'+UserID+'/deleteHobby',
    {headers: {
        'Content-Type': 'application/json;charset=utf-8'
        }, 
    method: "POST",
    body: JSON.stringify({hobby: delHobby})
    });                     
    const database = await prom.json();
    if(database.OK) {
        console.log("Deleted hobby: " + delHobby);
    }
    renderProfile(UserID, database);
}

async function addInterest() {
    const newInterest = document.getElementById("interest-add-input").value.split(' ')[0];
    const newScore = document.getElementById("interest-add-input").value.split(' ')[1];
    const prom = await fetch('/users/'+UserID+'/updateInterests',
    {headers: {
        'Content-Type': 'application/json;charset=utf-8'
        }, 
    method: "POST",
    body: JSON.stringify({interest: newInterest, score: newScore})
    });           
    const database = await prom.json();
    if(database.OK) {
        console.log("Added " + newInterest + " with score " + newScore);
    }
    renderProfile(UserID, database);
}

async function removeInterest() {
    const delInterest = document.getElementById("interest-remove-input").value;
    const prom = await fetch('/users/'+UserID+'/deleteInterest',
    {headers: {
        'Content-Type': 'application/json;charset=utf-8'
        }, 
    method: "POST",
    body: JSON.stringify({interest: delInterest})
    });                     
    const database = await prom.json();
    if(database.OK) {
        console.log("Deleted hobby: " + delInterest);
    }
    renderProfile(UserID, database);
}

async function renderProfile(userID, database) {
    let nameDiv = document.getElementById("name");
    nameDiv.innerHTML = database.Info[userID].name;
    let emailDiv = document.getElementById("email");
    emailDiv.innerHTML = database.Info[userID].email;

    let bioDiv = document.getElementById("bio");
    bioDiv.innerHTML = database.Bio[userID];

    let cityDiv = document.getElementById("city");
    cityDiv.innerHTML = database.Geo[userID].city;
    let areaDiv = document.getElementById("area");
    areaDiv.innerHTML = database.Geo[userID].area;

    let InterestNameDiv = document.getElementById("interest-name");
    let InterestScoreDiv = document.getElementById("interest-score");
    let HobbyNameDiv = document.getElementById("hobby-name");
    let HobbyScoreDiv = document.getElementById("hobby-score");

    while(HobbyNameDiv.lastChild) {
        HobbyNameDiv.removeChild(HobbyNameDiv.lastChild);
    }
    while(HobbyScoreDiv.lastChild) {
        HobbyScoreDiv.removeChild(HobbyScoreDiv.lastChild);
    }
    while(InterestNameDiv.lastChild) {
        InterestNameDiv.removeChild(InterestNameDiv.lastChild);
    }
    while(InterestScoreDiv.lastChild) {
        InterestScoreDiv.removeChild(InterestScoreDiv.lastChild);
    }

    for(const [hobby, score] of Object.entries(database.Hobbies[userID])) {
        let currHobby = document.createElement("h4");
        let currScore = document.createElement("h4");
        currHobby.innerHTML = hobby;
        currScore.innerHTML = score;
        HobbyNameDiv.appendChild(currHobby);
        HobbyScoreDiv.appendChild(currScore);
    }
    for(const [interest, score] of Object.entries(database.Interests[userID])) {
        let currInterest = document.createElement("h4");
        let currScore = document.createElement("h4");
        currInterest.innerHTML = interest;
        currScore.innerHTML = score;
        InterestNameDiv.appendChild(currInterest);
        InterestScoreDiv.appendChild(currScore);
    }

}