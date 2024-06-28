let currentSong = new Audio();
let songs;
let currentFolder;
let previousVolume = currentSong.volume;
let autoPlay = false;
const seekbar = document.querySelector(".seekbar");

function convertSecondsToMinuteSecond(seconds) {
  // Ensure the input is a number and not negative
  if (typeof seconds !== "number" || seconds < 0 || isNaN(seconds)) {
    return "00:00";
  }

  // Round down to the nearest second
  const totalSeconds = Math.floor(seconds);

  // Calculate minutes and remaining seconds
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  // Format minutes and seconds to ensure two digits with leading zeros if necessary
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  // Combine and return the formatted string
  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  currentFolder = folder;
  let a = await fetch(`/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  // Show all the songs in playlist

  let songUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML =
      songUL.innerHTML +
      `<li>
                  <img class="invert" src="assets/img/music.svg" alt="" />
                  <div class="info">
                    <div>${song.replaceAll("%20", " ")} </div>
                    <div>Artist</div>
                  </div>
                  <div class="playNow">
                    <span>Play Now</span>
                    <img class="invert" src="assets/img/play.svg" alt="" />
                  </div>
        </li>`;
  }

  //Attach an event listener to the song

  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });

  return songs;
}

const playMusic = (track, pause = false) => {
  //   let audio = new Audio("/Spotify%20Clone/songs/" + track);
  // audio.play()
  // console.log(track)
  // console.log(audio)

  currentSong.src = `/${currentFolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "assets/img/pause.svg";
  }

  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
  let a = await fetch(`/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchor = div.getElementsByTagName("a");
  let cardCointainer = document.querySelector(".cardContainer");
  let folders = [];
  let array = Array.from(anchor);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    if (e.href.includes("/songs")) {
      let folder = e.href.split("/").slice(-2)[0];
      //get the metadata from folder
      let a = await fetch(
        `/songs/${folder}/info.json`
      );
      let response = await a.json();
      cardCointainer.innerHTML =
        cardCointainer.innerHTML +
        `            <div class="card" data-folder="${folder}">
              <div class="cardChildContainer">
                <div class="play">
                  <img class="playbtn" src="assets/img/playlist_play.svg" alt="">
                </div>
                <div class="playlistsImage">
                  <img
                    src="/songs/${folder}/cover.jpg"
                    alt=""
                  />
                </div>
              </div>
              <h2>${response.title}</h2>
              <p>${response.description}</p>
            </div>`;
    }
  }

  // Load the playlist when a card is clicked

  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0]);
      document.querySelector(".left").style.left = "0";
    });
  });
}

async function main() {
  //Get the list of all the song
  await getSongs("songs/ncs");
  playMusic(songs[0], true);

  // Display album on the card

  displayAlbums();

  //Attach an event listener to the play, next and previous buttons

  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "assets/img/pause.svg";
    } else {
      currentSong.pause();
      play.src = "assets/img/play.svg";
    }
  });

  // Add an event listener to hamburger for next and previous song

  previous.addEventListener("click", () => {
    // console.log("previous clicked")
    // console.log(currentSong)
    // console.log(currentSong.src)
    // console.log(songs)
    currentSong.pause();
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  next.addEventListener("click", () => {
    console.log("next clicked");
    // console.log(currentSong)
    // console.log(currentSong.src)
    // console.log(songs)
    // console.log(currentSong.src.split("/").slice(-1)[0])
    // currentSong.pause();
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    // console.log(index)
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  //Listen for timeupdate event

  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(
      ".songtime"
    ).innerHTML = `${convertSecondsToMinuteSecond(
      currentSong.currentTime
    )} / ${convertSecondsToMinuteSecond(currentSong.duration)}`;

    document.querySelector(".seekbar").getElementsByTagName("input")[0].value =
      (currentSong.currentTime / currentSong.duration) * 1000;

    // document.querySelector(".circle").style.left =
    //   (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // Add an event listener to seekbar

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".seekbar").getElementsByTagName("input")[0].value =
      percent;
    // document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  // Add an event listener to hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  // Add an event listener to hamburger
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  // Add an event to volume

  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      currentSong.volume = parseInt(e.target.value) / 100;
      if (currentSong.volume > 0) {
        document.querySelector(".volume>img").src = document
          .querySelector(".volume>img")
          .src.replace("assets/img/mute.svg", "assets/img/volume.svg");
      } else {
        document.querySelector(".volume>img").src = document
          .querySelector(".volume>img")
          .src.replace("assets/img/volume.svg", "assets/img/mute.svg");
      }
    });

  //Add an event listener to mute the songs
  document.querySelector(".volume>img").addEventListener("click", (e) => {
    if (e.target.src.includes("assets/img/volume.svg")) {
      e.target.src = e.target.src.replace(
        "assets/img/volume.svg",
        "assets/img/mute.svg"
      );
      previousVolume = currentSong.volume;
      currentSong.volume = 0;
      document.querySelector(".range").getElementsByTagName("input")[0].value =
        currentSong.volume * 100;
    } else {
      e.target.src = e.target.src.replace(
        "assets/img/mute.svg",
        "assets/img/volume.svg"
      );
      currentSong.volume = previousVolume;
      document.querySelector(".range").getElementsByTagName("input")[0].value =
        currentSong.volume * 100;
    }
  });

  //Event Listener for autoplay toggle
  document.getElementById("autoPlay").addEventListener("click", () => {
    autoPlay = !autoPlay;
    let toggle = document.getElementById("autoPlayToggle");
    if (autoPlay) {
      toggle.innerHTML = " On";
      toggle.style.color = "lime";
    } else {
      toggle.innerHTML = "Off";
      toggle.style.color = "red";
    }
  });
}

//Event Listener for auto playing next song
currentSong.addEventListener("ended", () => {
  if (autoPlay) {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    } else {
      playMusic(songs[0]); // Optionally loop back to the first song
    }
  }
});

main();
