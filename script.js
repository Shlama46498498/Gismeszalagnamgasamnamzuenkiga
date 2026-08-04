// Language files configuration
const languageFiles = {
    'latin': 'data/latin_english.json',
    'greek': 'data/english_greek.json',
    'akkadian': 'data/assyrian_akkadian.json',
    'aramaic': 'data/assyrian_russian.json',
    'all': 'all' // Special case for showing all words
};

// Current selected language
let currentLanguage = 'all';
let vocabularyData = [];
let quizData = [];
let correctAnswers = 0;

// Load words for the selected language
async function loadWords(lang) {
    currentLanguage = lang;
    showLoading(true);

    try {
        if (lang === 'all') {
            // Special handling for 'all' language
            const allWords = [];
            for (const [key, file] of Object.entries(languageFiles)) {
                if (key === 'all') continue;
                const response = await fetch(file);
                if (!response.ok) {
                    console.error(`Failed to load ${file}: ${response.status}`);
                    continue;
                }
                const data = await response.json();
                allWords.push(...data);
            }
            vocabularyData = allWords;
            displayWords(allWords);
        } else {
            const response = await fetch(languageFiles[lang]);
            if (!response.ok) throw new Error(`File not found (${response.status})`);

            vocabularyData = await response.json();
            displayWords(vocabularyData);
        }
        updateLanguageDisplay(lang);
    } catch (error) {
        console.error(`Error loading ${lang} words:`, error);
        vocabularyData = [];
        displayWords([]);
    } finally {
        showLoading(false);
    }
}

// Display words in your existing format
function displayWords(words) {
    const container = document.getElementById('words-container');
    container.innerHTML = '';

    words.forEach(word => {
        const wordElement = document.createElement('div');
        wordElement.className = 'word-item';

        // Different display based on language pair
        if (currentLanguage === 'latin') {
            wordElement.innerHTML = `
                <div class="word">${word.latin}</div>
                <div class="translation">${word.english}</div>
            `;
        }
        else if (currentLanguage === 'greek') {
            wordElement.innerHTML = `
                <div class="word">${word.english}</div>
                <div class="translation">${word.greek}</div>
            `;
        }
        else if (currentLanguage === 'akkadian') {
            wordElement.innerHTML = `
                <div class="word">${word.assyrian}</div>
                <div class="translation">${word.akkadian}</div>
            `;
        }
        else if (currentLanguage === 'aramaic') {
            wordElement.innerHTML = `
                <div class="word">${word.assyrian}</div>
                <div class="translation">${word.russian}</div>
            `;
        }
        else { // 'all' language
            wordElement.innerHTML = `
                <div class="word">${word.latin || word.english || word.assyrian}</div>
                <div class="translation">${word.english || word.greek || word.akkadian || word.russian}</div>
            `;
        }

        container.appendChild(wordElement);
    });
}

// Update language display
function updateLanguageDisplay(lang) {
    const display = document.getElementById('current-language');
    const langNames = {
        'latin': 'Latin-English',
        'greek': 'English-Greek',
        'akkadian': 'Assyrian-Akkadian',
        'aramaic': 'Assyrian-Russian',
        'all': 'All Languages'
    };
    display.textContent = langNames[lang] || lang;
}

// Helper function to show/hide loading
function showLoading(show) {
    const loader = document.getElementById('loading');
    loader.style.display = show ? 'block' : 'none';
}

// Search functionality
function filterWords() {
    const searchTerm = document.getElementById('search-bar').value.toLowerCase();
    const words = document.querySelectorAll('.word-item');

    words.forEach(word => {
        const wordText = word.textContent.toLowerCase();
        word.style.display = wordText.includes(searchTerm) ? '' : 'none';
    });
}

// Quiz functionality
async function initializeQuiz() {
    if (vocabularyData.length === 0) {
        await loadWords(currentLanguage);
    }
    quizData = [...vocabularyData];
    correctAnswers = 0;
    document.getElementById('quiz-stats').textContent = `Correct Answers: ${correctAnswers}`;
    generateQuizQuestion();
}

function generateQuizQuestion() {
    if (quizData.length === 0) {
        document.getElementById('quiz-question').textContent = "Quiz completed! Refresh to try again.";
        document.getElementById('quiz-options').innerHTML = '';
        return;
    }

    const randomIndex = Math.floor(Math.random() * quizData.length);
    const currentWord = quizData[randomIndex];
    quizData.splice(randomIndex, 1);

    let questionText, correctAnswer, options;

    if (currentLanguage === 'latin') {
        questionText = currentWord.english;
        correctAnswer = currentWord.latin;
        options = getRandomOptions(correctAnswer, [currentWord.latin]);
    }
    else if (currentLanguage === 'greek') {
        questionText = currentWord.greek;
        correctAnswer = currentWord.english;
        options = getRandomOptions(correctAnswer, [currentWord.english]);
    }
    else if (currentLanguage === 'akkadian') {
        questionText = currentWord.akkadian;
        correctAnswer = currentWord.assyrian;
        options = getRandomOptions(correctAnswer, [currentWord.assyrian]);
    }
    else if (currentLanguage === 'aramaic') {
        questionText = currentWord.russian;
        correctAnswer = currentWord.assyrian;
        options = getRandomOptions(correctAnswer, [currentWord.assyrian]);
    }
    else { // 'all' language - default to latin
        questionText = currentWord.english;
        correctAnswer = currentWord.latin;
        options = getRandomOptions(correctAnswer, [currentWord.latin]);
    }

    displayQuizQuestion(questionText, options, correctAnswer);
}

function getRandomOptions(correctAnswer, existingOptions, count = 4) {
    const options = [...existingOptions];
    const allWords = vocabularyData.map(item => {
        if (currentLanguage === 'latin') return item.latin;
        if (currentLanguage === 'greek') return item.english;
        if (currentLanguage === 'akkadian') return item.assyrian;
        if (currentLanguage === 'aramaic') return item.assyrian;
        return '';
    }).filter(word => word && word !== correctAnswer);

    while (options.length < count && allWords.length > 0) {
        const randomIndex = Math.floor(Math.random() * allWords.length);
        const option = allWords[randomIndex];
        if (!options.includes(option)) {
            options.push(option);
        }
        allWords.splice(randomIndex, 1);
    }

    return options.sort(() => Math.random() - 0.5);
}

function displayQuizQuestion(questionText, options, correctAnswer) {
    const questionElement = document.getElementById('quiz-question');
    const optionsElement = document.getElementById('quiz-options');

    questionElement.textContent = questionText;
    optionsElement.innerHTML = '';

    options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option;
        button.className = 'quiz-option';
        button.onclick = () => checkAnswer(option, correctAnswer);
        optionsElement.appendChild(button);
    });
}

function checkAnswer(selected, correct) {
    if (selected === correct) {
        correctAnswers++;
        document.getElementById('quiz-stats').textContent = `Correct Answers: ${correctAnswers}`;
    }
    generateQuizQuestion();
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    loadWords('all'); // Load all words by default

    // Add event listeners to language buttons
    document.querySelectorAll('[data-language]').forEach(button => {
        button.addEventListener('click', () => {
            const lang = button.getAttribute('data-language');
            loadWords(lang);
        });
    });

    // Add quiz button event listener
    document.getElementById('start-quiz').addEventListener('click', initializeQuiz);
});
