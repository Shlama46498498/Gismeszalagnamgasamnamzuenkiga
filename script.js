// Language data cache
const languageData = {};

// DOM elements
const fromLanguageSelect = document.getElementById('from-language');
const toLanguageSelect = document.getElementById('to-language');
const loadBtn = document.getElementById('load-btn');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const wordList = document.getElementById('word-list');

// Language pairs mapping
const languagePairs = {
    'assyrian-akkadian': 'data/assyrian_akkadian.json',
    'assyrian-russian': 'data/assyrian_russian.json',
    'english-greek': 'data/english_greek.json',
    'latin-english': 'data/latin_english.json'
};

// Load dictionary data
async function loadDictionary() {
    const fromLang = fromLanguageSelect.value;
    const toLang = toLanguageSelect.value;
    const key = `${fromLang}-${toLang}`;

    if (!languagePairs[key]) {
        alert('No dictionary available for this language pair.');
        return;
    }

    try {
        const response = await fetch(languagePairs[key]);
        if (!response.ok) throw new Error('Failed to load dictionary');

        languageData[key] = await response.json();
        displayWords(languageData[key]);
    } catch (error) {
        console.error('Error loading dictionary:', error);
        wordList.innerHTML = '<p class="error">Failed to load dictionary. Please try again.</p>';
    }
}

// Display words in the list
function displayWords(data) {
    wordList.innerHTML = '';

    if (!data || !data.words) {
        wordList.innerHTML = '<p>No words found in this dictionary.</p>';
        return;
    }

    const words = Object.entries(data.words);

    if (words.length === 0) {
        wordList.innerHTML = '<p>No words found in this dictionary.</p>';
        return;
    }

    words.forEach(([englishWord, translations]) => {
        const wordItem = document.createElement('div');
        wordItem.className = 'word-item';

        // Determine the translation based on selected languages
        const fromLang = fromLanguageSelect.value;
        const toLang = toLanguageSelect.value;

        let translationText = '';
        if (fromLang === 'assyrian' && toLang === 'akkadian') {
            translationText = translations.akkadian || 'No translation';
        } else if (fromLang === 'assyrian' && toLang === 'russian') {
            translationText = translations.russian || 'No translation';
        } else if (fromLang === 'english' && toLang === 'greek') {
            translationText = translations.greek || 'No translation';
        } else if (fromLang === 'latin' && toLang === 'english') {
            translationText = translations.english || 'No translation';
        }

        wordItem.innerHTML = `
            <div class="word-term">${englishWord}</div>
            <div class="word-translation">${translationText}</div>
        `;

        wordList.appendChild(wordItem);
    });
}

// Search words
function searchWords() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const fromLang = fromLanguageSelect.value;
    const toLang = toLanguageSelect.value;
    const key = `${fromLang}-${toLang}`;

    if (!languageData[key]) {
        alert('Please load the dictionary first.');
        return;
    }

    const words = Object.entries(languageData[key].words);
    const filteredWords = words.filter(([englishWord]) =>
        englishWord.toLowerCase().includes(searchTerm)
    );

    if (filteredWords.length === 0) {
        wordList.innerHTML = '<p>No matching words found.</p>';
        return;
    }

    wordList.innerHTML = '';
    filteredWords.forEach(([englishWord, translations]) => {
        const wordItem = document.createElement('div');
        wordItem.className = 'word-item';

        let translationText = '';
        if (fromLang === 'assyrian' && toLang === 'akkadian') {
            translationText = translations.akkadian || 'No translation';
        } else if (fromLang === 'assyrian' && toLang === 'russian') {
            translationText = translations.russian || 'No translation';
        } else if (fromLang === 'english' && toLang === 'greek') {
            translationText = translations.greek || 'No translation';
        } else if (fromLang === 'latin' && toLang === 'english') {
            translationText = translations.english || 'No translation';
        }

        wordItem.innerHTML = `
            <div class="word-term">${englishWord}</div>
            <div class="word-translation">${translationText}</div>
        `;

        wordList.appendChild(wordItem);
    });
}

// Event listeners
loadBtn.addEventListener('click', loadDictionary);
searchBtn.addEventListener('click', searchWords);

// Allow search on Enter key
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchWords();
    }
});
