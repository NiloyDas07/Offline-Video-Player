// DOM Elements
const video = document.getElementById("videoPlayer");
const playButton = document.getElementById("playButton");
const playPauseBtn = document.getElementById("playPauseBtn");
const progressBar = document.getElementById("progressBar");
const progressContainer = document.getElementById("progressContainer");
const currentTimeEl = document.getElementById("currentTime");
const durationEl = document.getElementById("duration");
const muteBtn = document.getElementById("muteBtn");
const fullscreenBtn = document.getElementById("fullscreenBtn");
const themeToggle = document.querySelector(".theme-toggle");
const selectVideoBtn = document.querySelector(".select-video");
const addSubtitlesBtn = document.querySelector(".add-subtitles");
const playerContainer = document.getElementById("playerContainer");
const progressBubble = document.getElementById("progressBubble");

let isDragging = false;

// Format time in seconds to MM:SS format
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  seconds = Math.floor(seconds % 60);
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

// Update progress bar and time display
function updateProgress() {
  const progress = (video.currentTime / video.duration) * 100;
  progressBar.style.width = `${progress}%`;
  currentTimeEl.textContent = formatTime(video.currentTime);

  // Update bubble position
  progressBubble.style.transform = `translateY(-50%) translateX(${progress}%)`;
}

// Set video progress when clicking on progress bar
function setProgress(e, isDragging = false) {
  if (!video.duration) return;
  
  const rect = progressContainer.getBoundingClientRect();
  let clickX;
  
  if (e.type.includes('touch')) {
    clickX = e.touches[0].clientX - rect.left;
  } else {
    clickX = e.clientX - rect.left;
  }
  
  // Ensure clickX is within bounds
  clickX = Math.max(0, Math.min(clickX, rect.width));
  const progress = (clickX / rect.width) * 100;

  if (isDragging) {
    progressContainer.classList.add('dragging');
    progressBubble.classList.add('dragging');
}
  
  // Update the UI immediately
  progressBar.style.width = `${progress}%`;
  progressBubble.style.transform = `translateY(-50%) translateX(${progress}%)`;
  
  // Only update the video time if we're dragging or it's a click
  if (isDragging || e.type === 'mousedown' || e.type === 'touchstart') {
    video.currentTime = (clickX / rect.width) * video.duration;
    currentTimeEl.textContent = formatTime(video.currentTime);
  }
}

// Toggle play/pause
function togglePlay() {
  if (video.paused) {
    video.play();
    playButton.style.display = "none";
    playPauseBtn.children[0].style.display = "block";
    playPauseBtn.children[1].style.display = "none";
  } else {
    video.pause();
    playButton.style.display = "flex";
    playPauseBtn.children[0].style.display = "none";
    playPauseBtn.children[1].style.display = "block";
  }
}

// Toggle mute
function toggleMute() {
  video.muted = !video.muted;
  if (video.muted) {
    muteBtn.children[0].style.display = "none";
    muteBtn.children[1].style.display = "block";
  } else {
    muteBtn.children[0].style.display = "block";
    muteBtn.children[1].style.display = "none";
  }
}

// Toggle fullscreen
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    if (playerContainer.requestFullscreen) {
      playerContainer.requestFullscreen();
    } else if (playerContainer.webkitRequestFullscreen) {
      playerContainer.webkitRequestFullscreen();
    } else if (playerContainer.msRequestFullscreen) {
      playerContainer.msRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }
}

// Toggle theme
function toggleTheme() {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
}

// Handle video file selection
function handleVideoSelect() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "video/*";

  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const videoURL = URL.createObjectURL(file);
    video.src = videoURL;

    // Set video title
    document.title = `${file.name.replace(
      /\.[^/.]+$/,
      ""
    )} - Offline Video Player`;

    // Show play button
    playButton.style.display = "flex";

    // Load video metadata
    video.onloadedmetadata = () => {
      durationEl.textContent = formatTime(video.duration);
    };
  };

  input.click();
}

// Handle subtitle file selection
function handleSubtitleSelect() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".srt,.vtt";

  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const subtitleText = event.target.result;
      const blob = new Blob([subtitleText], { type: "text/vtt" });
      const subtitleURL = URL.createObjectURL(blob);

      // Remove existing track if any
      const existingTrack = video.querySelector("track");
      if (existingTrack) {
        video.removeChild(existingTrack);
      }

      // Add new track
      const track = document.createElement("track");
      track.kind = "captions";
      track.label = "English";
      track.srclang = "en";
      track.src = subtitleURL;
      video.appendChild(track);

      // Enable captions
      track.onload = () => {
        video.textTracks[0].mode = "showing";
      };
    };

    reader.readAsText(file);
  };

  input.click();
}

function endDrag() {
  isDragging = false;
  progressContainer.classList.remove('dragging');
  progressBubble.classList.remove('dragging');
};

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

  switch (e.code) {
    case "Space":
      e.preventDefault();
      togglePlay();
      break;
    case "ArrowLeft":
      video.currentTime = Math.max(0, video.currentTime - 5);
      break;
    case "ArrowRight":
      video.currentTime = Math.min(video.duration, video.currentTime + 5);
      break;
    case "KeyM":
      toggleMute();
      break;
    case "KeyF":
      toggleFullscreen();
      break;
  }
});

// Initialize
function init() {
  // Load saved theme
  const savedTheme = localStorage.getItem("theme") || "light";
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
  }

  // Set initial duration
  durationEl.textContent = formatTime(0);

  // Hide native controls
  video.controls = false;

  // Event listeners
  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      setProgress(e, true);
      e.preventDefault();
    }
  });
  document.addEventListener('mouseup', () => {
    endDrag();
  });
  document.addEventListener('touchmove', (e) => {
    if (isDragging) {
      setProgress(e, true);
      e.preventDefault();
    }
  }, { passive: false });
  
  document.addEventListener('touchend', () => {
    endDrag();
  });
  video.addEventListener('timeupdate', () => {
    const now = Date.now();
    if (!isDragging && now - lastUpdate > 50) { // Update at most every 50ms
        const progress = (video.currentTime / video.duration) * 100;
        progressBar.style.width = `${progress}%`;
        progressBubble.style.transform = `translateY(-50%) translateX(${progress}%)`;
        currentTimeEl.textContent = formatTime(video.currentTime);
        lastUpdate = now;
    }
  });
  video.addEventListener("click", togglePlay);
  video.addEventListener("ended", () => {
    playButton.style.display = "flex";
  });

  playButton.addEventListener("click", togglePlay);
  playPauseBtn.addEventListener("click", togglePlay);
  progressContainer.addEventListener("click", setProgress);
  progressContainer.addEventListener('mousedown', (e) => {
    isDragging = true;
    setProgress(e);
    // Prevent default to avoid text selection during drag
    e.preventDefault();
  });
  muteBtn.addEventListener("click", toggleMute);
  fullscreenBtn.addEventListener("click", toggleFullscreen);
  themeToggle.addEventListener("click", toggleTheme);
  selectVideoBtn.addEventListener("click", handleVideoSelect);
  addSubtitlesBtn.addEventListener("click", handleSubtitleSelect);

  // Show custom controls on hover
  playerContainer.addEventListener("mousemove", () => {
    playerContainer.classList.add("show-controls");
    clearTimeout(playerContainer.controlTimer);
    playerContainer.controlTimer = setTimeout(() => {
      if (!video.paused) {
        playerContainer.classList.remove("show-controls");
      }
    }, 3000);
  });

  playerContainer.addEventListener("mouseleave", () => {
    if (!video.paused) {
      playerContainer.classList.remove("show-controls");
    }
  });
  progressContainer.addEventListener('touchstart', (e) => {
    isDragging = true;
    setProgress(e);
  });

  progressBar.addEventListener('mousedown', (e) => {
    e.stopPropagation();
  });

  progressBubble.addEventListener('mousedown', (e) => {
    isDragging = true;
    progressContainer.classList.add('dragging');
    progressBubble.classList.add('dragging');
    e.preventDefault();
    e.stopPropagation();
  });
  progressBubble.addEventListener('touchstart', (e) => {
    isDragging = true;
    progressContainer.classList.add('dragging');
    progressBubble.classList.add('dragging');
    e.preventDefault();
    e.stopPropagation();
  });
}

// Initialize the app
init();
