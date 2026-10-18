const uselessButton = document.getElementById("uselessButton");
const buttonArena = document.getElementById("buttonArena");
const message = document.getElementById("message");
const helperText = document.getElementById("helperText");
const frogSpeech = document.getElementById("frogSpeech");
const clickCount = document.getElementById("clickCount");
const achievementCount = document.getElementById("achievementCount");
const chaosLevel = document.getElementById("chaosLevel");
const achievementList = document.getElementById("achievementList");
const soundToggle = document.getElementById("soundToggle");
const modalBackdrop = document.getElementById("modalBackdrop");
const errorText = document.getElementById("errorText");
const toast = document.getElementById("toast");
const secretCard = document.getElementById("secretCard");

// Game data
let clicks = 0;
let soundEnabled = true;
let chaosActive = false;
let popupCount = 0;
let dodgeCount = 0;
let audioContext = null;
let toastTimer;
let dodgeCooldown = false;
let chaosTimer;
let lastMessage = "";
let secretCelebrated = false;

const funnyMessages = [
  "Nothing happened. Congratulations. 😐",
  "Bro clicked a button. Historic. 📰",
  "The button has requested privacy. 💀",
  "Your finger needs a vacation. 🏖️",
  "Breaking news: absolutely nothing! 📺",
  "Achievement unlocked: professional button toucher. 🏆",
  "The frog is judging your life choices. 🐸",
  "Error 404: your free time not found. 🤡",
  "You expected a miracle? From THIS? 😭",
  "The button said no. Politely. Actually, rudely. 💅",
  "Your Wi-Fi is embarrassed for you. 📶",
  "Please stop. The button has a family. 👨‍👩‍👧",
  "Scientists are confused by your dedication. 🔬",
  "This is why we can't have nice things. 🫠",
  "Your reward is... another button click! 🎁",
  "The frog has filed a complaint. 📋",
  "Productivity has left the chat. 🚪",
  "Congratulations! You wasted one more second. ⏰",
  "I would explain, but there's nothing to explain. 🤷",
  "You click. I judge. We have a system. 🤝"
];

const buttonNames = [
  "CLICK ME!",
  "WHY THO?!",
  "NOPE 😂",
  "STOP IT 😭",
  "FREE FROG?",
  "CLICK AGAIN",
  "BAD IDEA 💀",
  "NOTHING HERE",
  "YOU AGAIN?!",
  "ABSOLUTELY NOT",
  "HELP ME 🆘",
  "OKAY FINE",
  "BONK! 💥"
];

const frogMessages = [
  "I saw that. 👀",
  "BESTIE, WHY?! 😭",
  "You again?! 🐸",
  "I need a holiday.",
  "This is getting weird.",
  "Your dedication scares me.",
  "I am literally a frog.",
  "Please touch grass. 🌱",
  "My lawyer will contact you.",
  "I regret everything."
];

const challenges = [
  "🕺 Do your silliest dance for 3 seconds. No witnesses? Even better.",
  "🐸 Say 'ribbit' like you're announcing the news.",
  "🎤 Sing one line of any song dramatically.",
  "🤨 Make your most confused face right now.",
  "🦆 Walk like a duck for five steps.",
  "🧙 Give yourself a ridiculous superhero name.",
  "👏 Clap three times like you just won an award.",
  "🌱 Name an imaginary plant. It is now your responsibility.",
  "🎭 Pretend you're a frog accepting an Oscar.",
  "🧠 Invent the world's most useless superpower.",
  "💃 Perform a tiny celebration for surviving this website.",
  "😎 Give your reflection a motivational speech.",
  "🐸 Tell the frog one good thing about today.",
  "🎲 Close your eyes and invent a random silly word.",
  "🏆 Congratulations! Your challenge is to do absolutely nothing."
];

const achievements = [
  {
    id: "first",
    icon: "🐣",
    name: "First Contact",
    description: "Click the button once.",
    goal: 1
  },
  {
    id: "ten",
    icon: "🔟",
    name: "Can't Stop",
    description: "Reach 10 clicks.",
    goal: 10
  },
  {
    id: "twentyfive",
    icon: "🤡",
    name: "Certified Clown",
    description: "Reach 25 clicks.",
    goal: 25
  },
  {
    id: "fifty",
    icon: "👑",
    name: "Button Royalty",
    description: "Reach 50 clicks.",
    goal: 50
  },
  {
    id: "hundred",
    icon: "🐸",
    name: "CEO of Nothing",
    description: "Reach 100 clicks.",
    goal: 100
  }
];

const unlockedAchievements = new Set();

// Build the achievement cards.
function renderAchievements() {
  achievementList.innerHTML = "";

  achievements.forEach((achievement) => {
    const unlocked = unlockedAchievements.has(achievement.id);
    const card = document.createElement("div");

    card.className = unlocked
      ? "achievement unlocked"
      : "achievement";

    const icon = document.createElement("span");
    icon.className = "achievement-icon";
    icon.textContent = unlocked ? "🏅" : achievement.icon;

    const details = document.createElement("div");
    const title = document.createElement("strong");
    const description = document.createElement("small");

    title.textContent = achievement.name;
    description.textContent = unlocked
      ? "Unlocked! You absolute legend."
      : achievement.description;

    details.append(title, description);
    card.append(icon, details);
    achievementList.appendChild(card);
  });

  achievementCount.textContent =
    `${unlockedAchievements.size}/${achievements.length}`;
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

// Avoid repeating the same funny message twice in a row.
function getFunnyMessage() {
  let nextMessage = randomItem(funnyMessages);

  if (funnyMessages.length > 1) {
    while (nextMessage === lastMessage) {
      nextMessage = randomItem(funnyMessages);
    }
  }

  lastMessage = nextMessage;
  return nextMessage;
}

// Browser sounds are generated locally.
// The browser may require a user interaction before sound can play.
function playSound(type = "click") {
  if (!soundEnabled) return;

  try {
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return;

    if (!audioContext) {
      audioContext = new AudioContextClass();
    }

    if (audioContext.state === "suspended") {
      audioContext.resume().catch(() => {});
    }

    if (audioContext.state !== "running") return;

    const presets = {
      click: { frequency: 560, duration: 0.08, wave: "sine" },
      pop: { frequency: 780, duration: 0.12, wave: "sine" },
      error: { frequency: 170, duration: 0.22, wave: "square" },
      win: { frequency: 900, duration: 0.18, wave: "triangle" },
      chaos: { frequency: 330, duration: 0.14, wave: "sawtooth" }
    };

    const preset = presets[type] || presets.click;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = preset.wave;
    oscillator.frequency.setValueAtTime(
      preset.frequency,
      audioContext.currentTime
    );

    if (type === "win") {
      oscillator.frequency.exponentialRampToValueAtTime(
        1300,
        audioContext.currentTime + preset.duration
      );
    }

    gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.12,
      audioContext.currentTime + 0.01
    );
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      audioContext.currentTime + preset.duration
    );

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + preset.duration + 0.02);
  } catch (error) {
    // Sound is optional; the game still works without it.
  }
}

function showToast(text) {
  clearTimeout(toastTimer);
  toast.textContent = text;
  toast.classList.add("show");

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2400);
}

function showFunnyMessage() {
  message.textContent = getFunnyMessage();
  frogSpeech.textContent = randomItem(frogMessages);
}

function updateStats() {
  clickCount.textContent = clicks;
  chaosLevel.textContent = `${Math.min(clicks, 100)}%`;
}

function unlockAchievements() {
  achievements.forEach((achievement) => {
    if (
      clicks >= achievement.goal &&
      !unlockedAchievements.has(achievement.id)
    ) {
      unlockedAchievements.add(achievement.id);
      renderAchievements();
      showToast(`${achievement.icon} Achievement unlocked: ${achievement.name}!`);
      playSound("win");
      launchConfetti(45);
    }
  });
}

function showSecretEnding() {
  if (clicks < 100) return;

  secretCard.hidden = false;

  if (!secretCelebrated) {
    secretCelebrated = true;
    secretCard.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

    showToast("👑 THE SECRET ENDING IS YOURS!");
    launchConfetti(150);
    playSound("win");
  }
}

// Button dodging works with mouse and touch.
// A cooldown prevents the button from moving continuously.
function moveButton() {
  if (dodgeCooldown) return;

  dodgeCooldown = true;
  dodgeCount++;

  const arenaRect = buttonArena.getBoundingClientRect();
  const buttonRect = uselessButton.getBoundingClientRect();

  const maxX = Math.max(0, arenaRect.width - buttonRect.width - 12);
  const maxY = Math.max(0, arenaRect.height - buttonRect.height - 12);

  const x = 6 + Math.random() * maxX;
  const y = 6 + Math.random() * maxY;

  uselessButton.classList.add("dodging");
  uselessButton.style.left = `${x}px`;
  uselessButton.style.top = `${y}px`;

  helperText.textContent = randomItem([
    "Too slow! 🏃",
    "Catch me if you can!",
    "I am SPEED. 💨",
    "Skill issue, bestie. 😭",
    "The button has legs now?!"
  ]);

  playSound("pop");

  setTimeout(() => {
    dodgeCooldown = false;
  }, 850);
}

// Mouse users get the classic runaway-button experience.
// Touch users can still click normally; after a successful click,
// the button sometimes dodges too.
uselessButton.addEventListener("pointerenter", (event) => {
  if (event.pointerType === "mouse" && clicks >= 2) {
    if (Math.random() < 0.45) {
      moveButton();
    }
  }
});

function shakeScreen() {
  document.body.classList.remove("shake");

  // Restart the animation.
  void document.body.offsetWidth;

  document.body.classList.add("shake");

  setTimeout(() => {
    document.body.classList.remove("shake");
  }, 420);
}

function spinPage() {
  document.body.classList.remove("spinning");
  void document.body.offsetWidth;
  document.body.classList.add("spinning");

  setTimeout(() => {
    document.body.classList.remove("spinning");
  }, 850);
}

function launchConfetti(amount = 70) {
  const confettiColors = [
    "#ff78ad",
    "#a78bfa",
    "#78dcb1",
    "#ffd166",
    "#85c9ff",
    "#f5a3ef"
  ];

  for (let i = 0; i < amount; i++) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";

    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.backgroundColor = randomItem(confettiColors);
    piece.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
    piece.style.setProperty(
      "--duration",
      `${1.5 + Math.random() * 2}s`
    );
    piece.style.setProperty(
      "--drift",
      `${Math.random() * 240 - 120}px`
    );

    document.body.appendChild(piece);

    piece.addEventListener("animationend", () => {
      piece.remove();
    }, { once: true });
  }
}

function floatEmoji(emoji) {
  const element = document.createElement("span");

  element.className = "floating-emoji";
  element.textContent = emoji;
  element.style.left = `${15 + Math.random() * 70}vw`;
  element.style.top = `${45 + Math.random() * 30}vh`;
  element.style.fontSize = `${20 + Math.random() * 20}px`;

  document.body.appendChild(element);

  element.addEventListener("animationend", () => {
    element.remove();
  }, { once: true });
}

function showFakeError() {
  popupCount++;

  const errorMessages = [
    "Your device has detected 97% silliness. Immediate frog supervision recommended.",
    "Button.exe has stopped making sense. Try absolutely nothing.",
    "Too many clicks detected. Please submit one imaginary complaint.",
    "Warning: your seriousness levels are dangerously low.",
    "System failure: purpose.dll could not be found anywhere."
  ];

  errorText.textContent = randomItem(errorMessages);
  modalBackdrop.hidden = false;
  playSound("error");
}

function closeFakeError() {
  modalBackdrop.hidden = true;
  showToast("Error fixed! Just kidding. Nothing was broken. 😂");
  playSound("pop");
}

function changeButtonName() {
  const currentName = uselessButton.textContent;
  let nextName = randomItem(buttonNames);

  while (nextName === currentName) {
    nextName = randomItem(buttonNames);
  }

  uselessButton.textContent = nextName;
}

function runRandomChallenge() {
  document.getElementById("challengeText").textContent =
    randomItem(challenges);

  playSound("pop");
}

// Random mini-games: quick, harmless challenges with a result.
function runMiniGame() {
  const games = [
    {
      question: "QUICK QUIZ: What is the frog's job?",
      options: ["Professional button judge", "Rocket scientist", "CEO of bananas"],
      correct: 0,
      win: "Correct! The frog is professionally unemployed. 🐸",
      lose: "Wrong! The frog is filing another complaint. 😂"
    },
    {
      question: "IMPORTANT: What happens when you click?",
      options: ["Nothing useful", "You become a wizard", "Free pizza appears"],
      correct: 0,
      win: "Exactly! You understand the purpose of nothing. 😭",
      lose: "Imagine if free pizza appeared. Sadly, no. 🍕"
    },
    {
      question: "Pick the frog's favourite colour.",
      options: ["Invisible", "Mint green", "Wednesday"],
      correct: 1,
      win: "The frog approves of your excellent taste. 🌱",
      lose: "The frog would like a word with you. 🐸"
    }
  ];

  const game = randomItem(games);
  const answer = window.prompt(
    `${game.question}\n\n` +
    game.options.map((option, index) =>
      `${index + 1}. ${option}`
    ).join("\n") +
    "\n\nType 1, 2, or 3:"
  );

  if (answer === null) {
    showToast("The mini-game has been abandoned. Fair enough. 😂");
    return;
  }

  if (answer.trim() === String(game.correct + 1)) {
    showToast(game.win);
    playSound("win");
    launchConfetti(30);
  } else {
    showToast(game.lose);
    playSound("error");
  }
}

function triggerRandomEffect() {
  const effects = [
    () => launchConfetti(80),
    () => shakeScreen(),
    () => spinPage(),
    () => floatEmoji("🐸"),
    () => floatEmoji("💗"),
    () => changeButtonName(),
    () => showFakeError(),
    () => runMiniGame()
  ];

  randomItem(effects)();
}

function activateChaosMode() {
  chaosActive = true;
  document.body.classList.add("chaos-mode");

  clearTimeout(chaosTimer);

  showToast("🤯 CHAOS ACTIVATED. The frog has lost control.");

  launchConfetti(120);
  shakeScreen();
  changeButtonName();
  playSound("chaos");

  // Keep chaos mode temporary so the page returns to normal.
  chaosTimer = setTimeout(() => {
    chaosActive = false;
    document.body.classList.remove("chaos-mode");
    showToast("Chaos has ended. The frog needs a nap. 🐸");
  }, 6000);

  // Run two extra surprises.
  setTimeout(() => {
    if (chaosActive) spinPage();
  }, 500);

  setTimeout(() => {
    if (chaosActive) floatEmoji("🤯");
  }, 1100);

  setTimeout(() => {
    if (chaosActive) launchConfetti(60);
  }, 1800);
}

function handleClick() {
  clicks++;

  updateStats();
  showFunnyMessage();
  playSound("click");
  unlockAchievements();

  // The name changes with every click.
  changeButtonName();

  // Add a different surprise on each click.
  const roll = Math.random();

  if (roll < 0.20) {
    launchConfetti(45);
  } else if (roll < 0.35) {
    shakeScreen();
  } else if (roll < 0.45) {
    spinPage();
  } else if (roll < 0.56) {
    floatEmoji(randomItem(["💗", "🐸", "✨", "😂", "🌸"]));
  } else if (roll < 0.65) {
    showFakeError();
  } else if (roll < 0.76) {
    playSound("pop");
  }

  // On touch screens, let the click succeed before moving.
  if (Math.random() < 0.22) {
    setTimeout(moveButton, 120);
  }

  // Every 15 clicks brings a mini-game.
  if (clicks % 15 === 0) {
    runMiniGame();
  }

  // A bigger surprise at 25 clicks.
  if (clicks === 25) {
    launchConfetti(100);
    showToast("25 clicks! Please consider touching grass. 🌱");
  }

  // Secret ending at 100 clicks.
  showSecretEnding();

  // Random extra effect every five clicks.
  if (clicks % 5 === 0) {
    setTimeout(triggerRandomEffect, 250);
  }
}

// The button refuses to be clicked!
uselessButton.addEventListener("pointerdown", (event) => {
  event.preventDefault();

  moveButton();

  message.textContent = "HAHAHA! YOU CAN'T CATCH ME! 😂";
  frogSpeech.textContent = "TOO SLOW, BESTIE! 🐸";

  playSound("pop");
});

// Also dodge when the mouse approaches.
uselessButton.addEventListener("pointerenter", () => {
  moveButton();
});

// Sound switch.
soundToggle.addEventListener("click", () => {
  soundEnabled = !soundEnabled;

  soundToggle.textContent = soundEnabled
    ? "🔊 Sound ON"
    : "🔇 Sound OFF";

  if (soundEnabled) {
    playSound("pop");
    showToast("Sound is back! Your ears have been warned. 😂");
  } else {
    showToast("Silence. The frog respects your peace. 🤫");
  }
});

// Random mini-challenge.
document.getElementById("challengeButton").addEventListener(
  "click",
  runRandomChallenge
);

// Chaos mode.
document.getElementById("chaosButton").addEventListener(
  "click",
  activateChaosMode
);

// Secret ending celebration.
document.getElementById("secretButton").addEventListener("click", () => {
  launchConfetti(180);
  playSound("win");
  showToast("👑 ALL HAIL THE CEO OF NOTHING!");
});

// Fake error popup controls.
document.getElementById("closeModal").addEventListener(
  "click",
  closeFakeError
);

document.getElementById("dismissError").addEventListener(
  "click",
  closeFakeError
);

// Close popup when clicking outside its card.
modalBackdrop.addEventListener("click", (event) => {
  if (event.target === modalBackdrop) {
    closeFakeError();
  }
});

// Close popup with Escape.
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modalBackdrop.hidden) {
    closeFakeError();
  }
});

// Reset all game progress.
document.getElementById("resetButton").addEventListener("click", () => {
  const confirmed = window.confirm(
    "Reset all clicks and achievements? The frog will forget everything. 🐸"
  );

  if (!confirmed) return;

  clicks = 0;
  popupCount = 0;
  dodgeCount = 0;
  lastMessage = "";
  secretCelebrated = false;
  unlockedAchievements.clear();

  clearTimeout(chaosTimer);
  chaosActive = false;

  document.body.classList.remove("chaos-mode", "shake", "spinning");
  modalBackdrop.hidden = true;
  secretCard.hidden = true;

  uselessButton.classList.remove("dodging");
  uselessButton.style.left = "";
  uselessButton.style.top = "";
  uselessButton.textContent = "CLICK ME!";

  message.textContent = "Nothing happened. 😐";
  helperText.textContent = "Go on. Press it. I double-dare you.";
  frogSpeech.textContent = "Don't you dare. 👀";
  document.getElementById("challengeText").textContent =
    "Your mission awaits, brave frog warrior.";

  document.querySelectorAll(
    ".confetti-piece, .floating-emoji"
  ).forEach((element) => element.remove());

  updateStats();
  renderAchievements();

  showToast("Fresh start! The frog remembers nothing. 🐸");
});

// Prepare the initial screen.
renderAchievements();
updateStats();