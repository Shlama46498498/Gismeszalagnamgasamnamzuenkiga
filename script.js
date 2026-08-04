// Language files configuration
const languageFiles = {
    'latin': 'data/latin_english.json',
    'assyrian_russian': 'data/assyrian_russian.json',
    'english_greek': 'data/english_greek.json',
    'assyrian_akkadian': 'data/assyrian_akkadian.json',
    'all': 'all' // Special case for showing all words
};

// Current selected language
let currentLanguage = 'all';
let vocabularyData = [];

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
                if (!response.ok) continue;
                const data = await response.json();
                allWords.push(...data);
            }
            vocabularyData = allWords;
            displayWords(allWords);
        } else {
            const response = await fetch(languageFiles[lang]);
            if (!response.ok) throw new Error('File not found');

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
        else if (currentLanguage === 'assyrian_english') {
            wordElement.innerHTML = `
                <div class="word">${word.assyrian}</div>
                <div class="translation">${word.english}</div>
            `;
        }
        else if (currentLanguage === 'assyrian_russian') {
            wordElement.innerHTML = `
                <div class="word">${word.assyrian}</div>
                <div class="translation">${word.russian}</div>
            `;
        }
        else if (currentLanguage === 'english_greek') {
            wordElement.innerHTML = `
                <div class="word">${word.english}</div>
                <div class="translation">${word.greek}</div>
            `;
        }
        else if (currentLanguage === 'assyrian_akkadian') {
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
        'assyrian_russian': 'Assyrian-Russian',
        'english_greek': 'English-Greek',
        'assyrian_akkadian': 'Assyrian-Akkadian',
        'all': 'All Languages'
    };
    display.textContent = langNames[lang] || lang;
}

// Helper function to show/hide loading
function showLoading(show) {
    const loader = document.getElementById('loading');
    loader.style.display = show ? 'block' : 'none';
}

// Initialize with default language and set up button event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadWords('all');  // Load all words by default

    // Add event listeners to all language buttons
    document.querySelectorAll('[data-language]').forEach(button => {
        button.addEventListener('click', () => {
            const lang = button.getAttribute('data-language');
            loadWords(lang);
        });
    });
});
