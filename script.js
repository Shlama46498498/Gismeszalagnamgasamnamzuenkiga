// Global variables
let currentData = [];
let currentWord = {};
let score = 0;
let totalQuestions = 0;

// DOM elements
const languageSelect = document.getElementById('language-pair');
const testBtn = document.getElementById('test-btn');
const wordDisplay = document.getElementById('word');
const userInput = document.getElementById('user-input');
const submitBtn = document.getElementById('submit-btn');
const feedback = document.getElementById('feedback');
const scoreDisplay = document.getElementById('score');
const totalDisplay = document.getElementById('total');

// Event listeners
testBtn.addEventListener('click', startTest);
submitBtn.addEventListener('click', checkAnswer);

// Load JSON data and start test
async function startTest() {
    const selectedPair = languageSelect.value;
    try {
        const response = await fetch(`data/${selectedPair}.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        currentData = await response.json();
        totalQuestions = currentData.length;
        score = 0;
        scoreDisplay.textContent = score;
        totalDisplay.textContent = totalQuestions;
        nextWord();
    } catch (error) {
        console.error('Error loading data:', error);
        feedback.textContent = 'Failed to load vocabulary data. Check console for details.';
        feedback.style.color = '#f44336';
    }
}

// Display next word
function nextWord() {
    if (currentData.length === 0) {
        feedback.textContent = 'Test complete! Refresh to try again.';
        return;
    }

    const randomIndex = Math.floor(Math.random() * currentData.length);
    currentWord = currentData[randomIndex];
    currentData.splice(randomIndex, 1);

    // Display the word in the target language
    const selectedPair = languageSelect.value;
    const [lang1, lang2] = selectedPair.split('_');

    // Alternate between showing lang1 or lang2
    const showLang1 = Math.random() > 0.5;
    wordDisplay.textContent = showLang1 ? currentWord[lang1] : currentWord[lang2];
    userInput.value = '';
    userInput.focus();
    feedback.textContent = '';
}

// Check user's answer
function checkAnswer() {
    const userAnswer = userInput.value.trim().toLowerCase();
    const selectedPair = languageSelect.value;
    const [lang1, lang2] = selectedPair.split('_');

    // Determine the correct answer
    const shownLang = wordDisplay.textContent === currentWord[lang1] ? lang1 : lang2;
    const correctAnswer = shownLang === lang1 ? currentWord[lang2] : currentWord[lang1];

    if (userAnswer === correctAnswer.toLowerCase()) {
        feedback.textContent = 'Correct! Well done, scholar.';
        feedback.style.color = '#4CAF50';
        score++;
    } else {
        feedback.textContent = `Incorrect. The correct answer was: ${correctAnswer}`;
        feedback.style.color = '#f44336';
    }

    scoreDisplay.textContent = score;
    nextWord();
}
