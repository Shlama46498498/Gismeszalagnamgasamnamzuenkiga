// Language files configuration
const languageFiles = {
    'latin': 'data/latin_english.json',
    'assyrian-russian': 'data/assyrian_russian.json',
    'english-greek': 'data/english_greek.json',
    'assyrian-akkadian': 'data/assyrian_akkadian.json'
};

// Current selected language
let currentLanguage = 'all';
let vocabularyData = [];

// Load words for the selected language
async function loadWords(lang) {
    currentLanguage = lang;
    showLoading(true);

    try {
        const response = await fetch(languageFiles[lang]);
        if (!response.ok) throw new Error('File not found');

        vocabularyData = await response.json();
        displayWords(vocabularyData);
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
        else if (currentLanguage === 'assyrian-english') {
            wordElement.innerHTML = `
                <div class="word">${word.assyrian}</div>
                <div class="translation">${word.english}</div>
            `;
        }
        else if (currentLanguage === 'assyrian-russian') {
            wordElement.innerHTML = `
                <div class="word">${word.assyrian}</div>
                <div class="translation">${word.russian}</div>
            `;
        }
        else if (currentLanguage === 'english-greek') {
            wordElement.innerHTML = `
                <div class="word">${word.english}</div>
                <div class="translation">${word.greek}</div>
            `;
        }
        else if (currentLanguage === 'assyrian-akkadian') {
            wordElement.innerHTML = `
                <div class="word">${word.assyrian}</div>
                <div class="translation">${word.akkadian}</div>
            `;
        }
        else { // 'all' language
            wordElement.innerHTML = `
                <div class="word">${word.word || word.latin || word.assyrian}</div>
                <div class="translation">${word.translation || word.english || word.russian || word.greek || word.akkadian}</div>
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
        'assyrian-russian': 'Assyrian-Russian',
        'english-greek': 'English-Greek',
        'assyrian-akkadian': 'Assyrian-Akkadian'
    };
    display.textContent = langNames[lang] || lang;
}

// Helper function to show/hide loading
function showLoading(show) {
    const loader = document.getElementById('loading');
    loader.style.display = show ? 'block' : 'none';
}

// Initialize with default language
document.addEventListener('DOMContentLoaded', () => {
    loadWords('all');  // Load all words by default
});
