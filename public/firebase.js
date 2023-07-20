import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { getDatabase, ref, set, onDisconnect, onValue, onChildAdded, onChildRemoved, update } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBaKGwDHbpqtuEzZq23BYtRtj-hUPJA2XU",
  authDomain: "flappy-birdio-multiplayer.firebaseapp.com",
  databaseURL: "https://flappy-birdio-multiplayer-default-rtdb.firebaseio.com",
  projectId: "flappy-birdio-multiplayer",
  storageBucket: "flappy-birdio-multiplayer.appspot.com",
  messagingSenderId: "575385441486",
  appId: "1:575385441486:web:e2881a3795ee69fe26ec9f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

//Networking Settings
let playerId;
let playerRef;
let players = {};

function randomFromArray(array) {
  return array[Math.floor(Math.random() * array.length)];
}
function getKeyString(x, y) {
  return `${x}x${y}`;
}

function createName() {
  const prefix = randomFromArray([
    "COOL",
    "SUPER",
    "HIP",
    "SMUG",
    "COOL",
    "SILKY",
    "GOOD",
    "SAFE",
    "DEAR",
    "DAMP",
    "WARM",
    "RICH",
    "LONG",
    "DARK",
    "SOFT",
    "BUFF",
    "DOPE",
  ]);
  const animal = randomFromArray([
    "BEAR",
    "DOG",
    "CAT",
    "FOX",
    "LAMB",
    "LION",
    "BOAR",
    "GOAT",
    "VOLE",
    "SEAL",
    "PUMA",
    "MULE",
    "BULL",
    "BIRD",
    "BUG",
  ]);
  return `${prefix} ${animal}`;
}

function updateScoreboardPlayers() {
  const scoreboard = document.getElementById('scoreboard');

  scoreboard.innerHTML = Object.keys(players).map((id) => {
    const playerData = players[id];
    const isYou = playerData.id === playerId; 
    
    return (`
      <div class="scoreboard-item">
        <p><strong>Name:</strong> <span>${isYou ? playerData.name.concat(" ", "(You)") : playerData.name}</span></p>
        <p><strong>Best Score:</strong> <span>${playerData.points}</span></p>
        <br/>
      </div>`)}).join('');
}

export function setup_network() {
  const playerNameInput = document.querySelector("#player-name");
  const allPlayersRef =ref(db, `players`);

  signInAnonymously(auth).catch((error) => {
    var errorCode = error.code;
    var errorMessage = error.message;
    // ...
    console.log(errorCode, errorMessage);
  });

  onAuthStateChanged(auth, (user) => {
    if (user) {
      //You're logged in!
      playerId = user.uid;
      playerRef = ref(db, `players/${playerId}`);
  
      const name = createName();
  
      set(playerRef, {
        id: playerId,
        name,
        points: 0,
    });
  
      //Remove me from Firebase when I diconnect
      onDisconnect(playerRef).remove();
  
      //Begin the game now that we are signed in
    } else {
      //You're logged out.
    }
  })

  onValue(allPlayersRef, (snapshot) => {
    //Fires whenever a change occurs
    players = snapshot.val() || {};
    updateScoreboardPlayers();
  })

  onChildAdded(allPlayersRef, (snapshot) => {
    //Fires whenever a new node is added the tree
    const addedPlayer = snapshot.val();
    console.log('hji');
    players[addedPlayer.id] = addedPlayer;
    updateScoreboardPlayers();
  })

  playerNameInput.addEventListener("change", (e) => {
    const newName = e.target.value || createName();
    playerNameInput.value = newName;
    update(playerRef, {
      name: newName
    })
  })

  onChildRemoved(allPlayersRef, (snapshot) => {
    const removedKey = snapshot.val().id;
    delete players[removedKey];
    updateScoreboardPlayers();
  })

}

export function scorePipe(newScore) {
  update(playerRef, {
    points: newScore,
  })
}
