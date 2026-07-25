const WORDS_URL = "words.json"; 

let globalDatabase = [];
let currentWords = [];
let score = 0;
let currentCorrectAnswer = null;

const titles = {
    latin: "Latin Language (Thomas Goodwin Dictionary)",
    greek: "Ancient Greek (Perseus Base)",
    akkadian: "Akkadian Language (Cuneiform / ORACC)",
    aramaic: "Assyrian Aramaic (Syriac Script)"
};

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch(WORDS_URL);
        globalDatabase = await response.json(); 
        switchLanguage('latin'); 
    } catch (error) {
        document.getElementById("lang-title").innerText = "Loading Error";
        document.getElementById("vocab-list").innerHTML = 
            "<span style='color:red;'>Could not download words. Please check your words.json file in repository!</span>";
    }
});

function switchLanguage(lang) {
    currentWords = globalDatabase.filter(item => item.lang === lang);
    document.getElementById("lang-title").innerText = titles[lang] || "Dictionary";
    displayWords(currentWords);
    generateQuizQuestion();
}

function displayWords(words) {
    const listContainer = document.getElementById("vocab-list");
    listContainer.innerHTML = "";
    const shortList = words.slice(0, 150); 
    if (shortList.length === 0) {
        listContainer.innerHTML = "No words found in this section.";
        return;
    }
    shortList.forEach(item => {
        const card = document.createElement("div");
        card.className = "word-card";
        card.innerHTML = `
            <div class="original">${item.word}</div>
            ${item.translit ? `<div class="translit">[${item.translit}]</div>` : ''}
            <div class="translation">${item.translation}</div>
        `;
        listContainer.appendChild(card);
    });
}

function filterWords() {
    const query = document.getElementById("search-bar").value.toLowerCase();
    const filtered = currentWords.filter(item => 
        item.word.toLowerCase().includes(query) || 
        item.translation.toLowerCase().includes(query)
    );
    displayWords(filtered);
}

function generateQuizQuestion() {
    document.getElementById("next-btn").style.display = "none";
    if (currentWords.length < 4) {
        document.getElementById("quiz-question").innerText = "Not enough words for the quiz test.";
        return;
    }
    const correctItem = currentWords[Math.floor(Math.random() * currentWords.length)];
    currentCorrectAnswer = correctItem.translation;
    document.getElementById("quiz-question").innerText = `How do you translate the word: "${correctItem.word}"?`;
    let options = [correctItem.translation];
    while (options.length < 4) {
        const randomItem = currentWords[Math.floor(Math.random() * currentWords.length)];
        if (!options.includes(randomItem.translation)) {
            options.push(randomItem.translation);
        }
    }
    options.sort(() => Math.random() - 0.5);
    const optionsContainer = document.getElementById("quiz-options");
    optionsContainer.innerHTML = "";
    options.forEach(opt => {
        const btn = document.createElement("button");
        btn.className = "quiz-option";
        btn.innerText = opt;
        btn.onclick = () => {
            const buttons = document.querySelectorAll(".quiz-option");
            buttons.forEach(b => b.disabled = true);
            if (opt === currentCorrectAnswer) {
                btn.style.backgroundColor = "#c8e6c9";
                score++;
                document.getElementById("quiz-stats").innerText = `Correct Answers: ${score}`;
            } else {
                btn.style.backgroundColor = "#ffcdd2";
                buttons.forEach(b => { if(b.innerText === currentCorrectAnswer) b.style.backgroundColor = "#c8e6c9"; });
            }
            document.getElementById("next-btn").style.display = "block";
        };
        optionsContainer.appendChild(btn);
    });
}
