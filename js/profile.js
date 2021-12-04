'use strict';

document.getElementById('reset-btn').addEventListener("click", resetProfile);
document.getElementById("name-btn").addEventListener("click", updateName);
document.getElementById('bio-btn').addEventListener("click", updateBio);
document.getElementById('city-btn').addEventListener("click", updateCity);
document.getElementById('area-btn').addEventListener("click", updateArea);
document.getElementById('hobby-add-btn').addEventListener("click", addHobby);
document.getElementById('hobby-remove-btn').addEventListener("click", removeHobby);
document.getElementById('interest-add-btn').addEventListener("click", addInterest);
document.getElementById('interest-remove-btn').addEventListener("click", removeInterest);


async function updateName() {
    const updatedName = document.getElementById("name-input").value;
    const userId = document.getElementById("email").innerHTML;
    const prom = await fetch(`/profile/${userId}/updateName`, 
        {headers: {
            'Content-Type': 'application/json;charset=utf-8',
            'Accept': 'application/json'
            }, 
        method: "POST",
        body: JSON.stringify({name: updatedName})
    }).then(async res => {
    const profile = await res.json();
    renderProfile(profile);
    });
}

async function updateBio() {
    const updatedBio = document.getElementById("bio-input").value;
    const userId = document.getElementById("email").innerHTML;
    const prom = await fetch(`/profile/${userId}/updateBio`, 
        {headers: {
            'Content-Type': 'application/json;charset=utf-8',
            'Accept': 'application/json'
            }, 
        method: "POST",
        body: JSON.stringify({bio: updatedBio})
    }).then(async res => {
    const profile = await res.json();
    renderProfile(profile);
    });
}

async function updateCity() {
    const updatedCity = document.getElementById("city-input").value;
    const userId = document.getElementById("email").innerHTML;
    const prom = await fetch(`/profile/${userId}/updateCity`, 
        {headers: {
            'Content-Type': 'application/json;charset=utf-8',
            'Accept': 'application/json'
            }, 
        method: "POST",
        body: JSON.stringify({city: updatedCity})
    }).then(async res => {
    const profile = await res.json();
    renderProfile(profile);
    });
}

async function updateArea() {
    const updatedArea = document.getElementById("area-input").value;
    const userId = document.getElementById("email").innerHTML;
    await fetch(`/profile/${userId}/updateArea`, 
        {headers: {
            'Content-Type': 'application/json;charset=utf-8',
            'Accept': 'application/json'
            }, 
        method: "POST",
        body: JSON.stringify({area: updatedArea})
    }).then(async res => {
    const profile = await res.json();
    renderProfile(profile);
    });
}

async function addHobby() {
    const newHobby = document.getElementById("hobby-add-input").value.split(' ')[0];
    const newScore = document.getElementById("hobby-add-input").value.split(' ')[1];
    const userId = document.getElementById("email").innerHTML;
    const prom = await fetch(`/profile/${userId}/updateHobbies`,
    {headers: {
        'Content-Type': 'application/json;charset=utf-8',
        'Accept': 'application/json'
        }, 
    method: "POST",
    body: JSON.stringify({hobby: newHobby, score: newScore})
    }).then(async res => {          
    const profile = await res.json();
    renderProfile(profile);
    });
}

async function removeHobby() {
    const delHobby = document.getElementById("hobby-remove-input").value;
    const userId = document.getElementById("email").innerHTML;
    const prom = await fetch(`/profile/${userId}/removeHobby`,
    {headers: {
        'Content-Type': 'application/json;charset=utf-8',
        'Accept': 'application/json'
        }, 
    method: "DELETE",
    body: JSON.stringify({hobby: delHobby})
    });                     
    const profile = await prom.json();
    renderProfile(profile);
}

async function addInterest() {
    const newInterest = document.getElementById("interest-add-input").value.split(' ')[0];
    const newScore = document.getElementById("interest-add-input").value.split(' ')[1];
    const userId = document.getElementById("email").innerHTML;
    const prom = await fetch(`/profile/${userId}/updateInterests`,
    {headers: {
        'Content-Type': 'application/json;charset=utf-8',
        'Accept': 'application/json'
        }, 
    method: "POST",
    body: JSON.stringify({interest: newInterest, score: newScore})
    }).then(async res => {          
    const profile = await res.json();
    renderProfile(profile);
    });
}

async function removeInterest() {
    const delInterest = document.getElementById("interest-remove-input").value;
    const userId = document.getElementById("email").innerHTML;
    const prom = await fetch(`/profile/${userId}/removeInterest`,
    {headers: {
        'Content-Type': 'application/json;charset=utf-8',
        'Accept': 'application/json'
        }, 
    method: "DELETE",
    body: JSON.stringify({interest: delInterest})
    });                     
    const profile = await prom.json();
    renderProfile(profile);
}

async function resetProfile() {
    const userId = document.getElementById("email").innerHTML;
    const prom = await fetch(`/profile/${userId}/resetProfile`,
    {headers: {
        'Content-Type': 'application/json;charset=utf-8',
        'Accept': 'application/json'
    },
    method: "DELETE"
    });
    loadProfile(userId);
}


function renderProfile(profile) {
    let nameDiv = document.getElementById("name");
    nameDiv.innerHTML = profile.info.Name;
    let emailDiv = document.getElementById("email");
    emailDiv.innerHTML = profile.info.Email;

    let bioDiv = document.getElementById("bio");
    bioDiv.innerHTML = profile.bio;

    let cityDiv = document.getElementById("city");
    cityDiv.innerHTML = profile.geo.City;
    let areaDiv = document.getElementById("area");
    areaDiv.innerHTML = profile.geo.Area;


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

    for(const entry of profile.hobbies) {
        const hobby = entry["hobby"];
        const score = entry["score"];
        let currHobby = document.createElement("h4");
        let currScore = document.createElement("h4");
        currHobby.innerHTML = hobby;
        currScore.innerHTML = score;
        HobbyNameDiv.appendChild(currHobby);
        HobbyScoreDiv.appendChild(currScore);
    }
    for(const entry of profile.interests) {
        const interest = entry["interest"];
        const score = entry["score"];
        let currInterest = document.createElement("h4");
        let currScore = document.createElement("h4");
        currInterest.innerHTML = interest;
        currScore.innerHTML = score;
        InterestNameDiv.appendChild(currInterest);
        InterestScoreDiv.appendChild(currScore);
    }

}

async function loadProfile(username) {
    const prom = await fetch(`/profile/${username}`, 
    {headers: {
        'Content-Type': 'application/json;charset=utf-8'
        },        
    method: "GET"
    }).then(async res => {
        const profile = await res.json();
        renderProfile(profile);
    });
}

loadProfile('kirkj@email.com');