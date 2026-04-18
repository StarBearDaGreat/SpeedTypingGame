const sentences = [
    "The quick brown fox jumps over the lazy dog.",
    "Pack my box with five dozen liquor jugs.",
    "How vexingly quick daft zebras jump!",
    "The five boxing wizards jump quickly at dawn.",
    "Sphinx of black quartz, judge my vow.",
    "Two driven jocks help fax my big quiz.",
    "Five quacking zephyrs jolt my wax bed.",
    "The tricky fox jumped over the lazy brown dog.",
    "A quick movement of the enemy will jeopardize six gunboats.",
    "All questions asked by five watch experts amazed the judge.",
    "We promptly judged antique ivory buckles for the next prize.",
    "Crazy Fredericka bought many very exquisite opal jewels.",
    "Sixty zippers were quickly picked from the woven jute bag.",
    "A mad boxer shot a quick, gloved jab to the jaw of his dizzy opponent.",
    "Jaded zombies acted quaintly but kept driving their oxen forward.",
    "A large fawn jumped quickly over white zinc boxes.",
    "The job requires extra pluck and zeal from every young wage earner.",
    "A quivering Texas zombie fought republicans with jokes.",
    "Vampyre nymph, quiz! go. fjords, buck, watch.",
    "Quick wafting zephyrs vex bold Jim.",
    "My girl wove six dozen plaid jackets before she quit.",
    "Heavy boxes perform quick waltzes and jigs."
];

// Elements
const sentenceDisplay = document.getElementById("sentence-display");
const typeInput = document.getElementById("type-input");
const speedEl = document.getElementById("stat-speed");
const wpmEl = document.getElementById("stat-wpm");
const errorsEl = document.getElementById("stat-errors");
const accuracyEl = document.getElementById("stat-accuracy");
const nextRoundBtn = document.getElementById("next-round-btn");
const leaderboardBody = document.getElementById("leaderboard-body");

// Game State
let currentSentence = "";
let lastSentenceIndex = -1;
let isPlaying = false;
let totalKeystrokes = 0;
let errors = 0;
let previousInputLength = 0;
let startTime = null;
let timerInterval = null;
let roundId = 0;

// Leaderboard Data
let leaderboardData = [];

function initRound() {
    // Reset state
    isPlaying = false;
    totalKeystrokes = 0;
    errors = 0;
    previousInputLength = 0;
    startTime = null;
    clearInterval(timerInterval);
    
    // Choose specific random sentence (avoid immediate repeat)
    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * sentences.length);
    } while (randomIndex === lastSentenceIndex && sentences.length > 1);
    
    lastSentenceIndex = randomIndex;
    currentSentence = sentences[randomIndex];
    
    // Reset UI
    typeInput.value = "";
    typeInput.disabled = false;
    typeInput.focus();
    nextRoundBtn.classList.add("hidden");
    
    speedEl.textContent = "0.00s";
    wpmEl.textContent = "0";
    errorsEl.textContent = "0";
    accuracyEl.textContent = "100.0%";
    
    renderSentenceDisplay("");
}

function renderSentenceDisplay(inputValue) {
    sentenceDisplay.innerHTML = "";
    
    const chars = currentSentence.split("");
    const inputChars = inputValue.split("");
    
    chars.forEach((char, index) => {
        const span = document.createElement("span");
        span.innerText = char;
        
        if (index < inputChars.length) {
            // Typed char
            if (inputChars[index] === char) {
                span.classList.add("correct");
            } else {
                span.classList.add("incorrect");
            }
        } else if (index === inputChars.length) {
            // Current cursor position
            span.classList.add("active");
        }
        
        sentenceDisplay.appendChild(span);
    });
}

function startTimer() {
    isPlaying = true;
    startTime = Date.now();
    
    timerInterval = setInterval(() => {
        updateStatsUI(false);
    }, 100);
}

function updateStatsUI(isFinal) {
    if (!startTime) return;
    
    const timeNow = isFinal ? startTime + parseFloat(speedEl.textContent) * 1000 : Date.now();
    // if final, we don't recalculate time exactly from Date.now, but wait, 
    // it's better to just recalculate everything based on Date.now() if it's the last moment.
    const timeElapsedSec = isFinal ? (timeNow - startTime) / 1000 : (Date.now() - startTime) / 1000;
    
    const timeElapsedMin = timeElapsedSec / 60;
    
    const wpm = timeElapsedMin > 0 ? ((totalKeystrokes / 5) / timeElapsedMin) : 0;
    const accuracy = totalKeystrokes > 0 ? ((totalKeystrokes - errors) / totalKeystrokes) * 100 : 100;
    
    speedEl.textContent = timeElapsedSec.toFixed(2) + "s";
    wpmEl.textContent = Math.round(wpm);
    errorsEl.textContent = errors;
    accuracyEl.textContent = accuracy.toFixed(1) + "%";
}

function endRound() {
    isPlaying = false;
    clearInterval(timerInterval);
    typeInput.disabled = true;
    
    // Final stats update
    updateStatsUI(false);
    
    const timeElapsedSec = (Date.now() - startTime) / 1000;
    const timeElapsedMin = timeElapsedSec / 60;
    const wpm = timeElapsedMin > 0 ? Math.round((totalKeystrokes / 5) / timeElapsedMin) : 0;
    const accuracy = totalKeystrokes > 0 ? (((totalKeystrokes - errors) / totalKeystrokes) * 100).toFixed(1) : "100.0";
    
    roundId++;
    
    const roundData = {
        id: roundId,
        wpm: wpm,
        accuracy: accuracy,
        speed: timeElapsedSec.toFixed(2) + "s",
        errors: errors
    };
    
    leaderboardData.push(roundData);
    renderLeaderboard();
    
    nextRoundBtn.classList.remove("hidden");
    nextRoundBtn.focus();
}

function renderLeaderboard() {
    leaderboardBody.innerHTML = "";
    
    // Sort descending by WPM
    const sortedData = [...leaderboardData].sort((a, b) => b.wpm - a.wpm);
    
    sortedData.forEach((row, index) => {
        const tr = document.createElement("tr");
        
        // Highlight logic: most recent round
        if (row.id === roundId) {
            tr.classList.add("highlight");
        }
        
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${row.wpm}</td>
            <td>${row.accuracy}%</td>
            <td>${row.speed}</td>
            <td>${row.errors}</td>
        `;
        
        leaderboardBody.appendChild(tr);
    });
}

// Event Listeners
typeInput.addEventListener("input", (e) => {
    const inputValue = typeInput.value;
    
    // Check if user just started typing
    if (!isPlaying && inputValue.length > 0) {
        startTimer();
    }
    
    // To handle keystrokes logic:
    // If length increased, a keystroke happened
    if (inputValue.length > previousInputLength) {
        // We consider the newly added characters
        const addedChars = inputValue.length - previousInputLength;
        for (let i = 0; i < addedChars; i++) {
            const charIndex = previousInputLength + i;
            totalKeystrokes++;
            
            // Check if error - limit bound checking
            if (charIndex < currentSentence.length) {
                if (inputValue[charIndex] !== currentSentence[charIndex]) {
                    errors++;
                }
            } else {
                // Formatting out of bounds is also an error
                errors++;
            }
        }
    }
    
    previousInputLength = inputValue.length;
    renderSentenceDisplay(inputValue);
    
    // Check win condition
    if (inputValue === currentSentence) {
        endRound();
    }
});

typeInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && isPlaying) {
        endRound();
    }
});

nextRoundBtn.addEventListener("click", () => {
    initRound();
});

// Initialize first round
initRound();
