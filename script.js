// Antiquarium Quiz Logic Controller
let quizData = [];
let currentQuestionIndex = 0;
let score = 0;
let currentDatasetName = "";
const TOTAL_QUESTIONS_PER_RUN = 10;

// Конфигурация под твою точную структуру JSON
const schemaMappings = {
    "assyrian_akkadian": { wordKey: "key", definitionKey: "akkadian", displayTitle: "Assyrian - Akkadian Archive" },
    "assyrian_russian": { wordKey: "key", definitionKey: "translation", displayTitle: "Assyrian - Russian Codex" },
    "english_greek": { wordKey: "key", definitionKey: "greek", displayTitle: "English - Greek Compendium" },
    "latin_english": { wordKey: "key", definitionKey: "english", displayTitle: "Latin - English Folio" }
};

// Загрузка файла с учетом особенностей GitHub Pages
async function selectDataset(datasetId) {
    currentDatasetName = datasetId;
    
    const basePath = window.location.pathname.endsWith('/') 
        ? window.location.pathname 
        : window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
        
    const finalUrl = `${window.location.origin}${basePath}data/${datasetId}.json`;

    try {
        const response = await fetch(finalUrl);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: Failed to reach file.`);
        }
        const rawData = await response.json();
        prepareQuizPool(rawData);
    } catch (error) {
        console.error("Archive Retrieval Error:", error);
        alert(`ОШИБКА ЗАГРУЗКИ!\n\nСкрипт пытался найти файл по адресу:\n${finalUrl}\n\nЧто проверить:\n1. Папка на GitHub называется именно "data" (маленькими буквами).\n2. Файл называется именно "${datasetId}.json" (маленькими буквами).`);
    }
}

// Парсинг сложного JSON объекта в плоский массив для теста
function prepareQuizPool(rawData) {
    const mapping = schemaMappings[currentDatasetName];
    quizData = [];

    // Проверяем, есть ли корневой объект "words"
    if (rawData && rawData.words) {
        const wordsObject = rawData.words;
        
        // Проходим по каждому ключу (например, "to bring along")
        for (const [key, value] of Object.entries(wordsObject)) {
            // value — это объект типа { "akkadian": "abaku" }
            const definition = value[mapping.definitionKey];
            
            if (key && definition) {
                quizData.push({
                    word: key, // Само слово берем из названия ключа
                    definition: definition // Перевод берем из внутреннего поля
                });
            }
        }
    }

    if (quizData.length < 4) {
        alert("The collection pool contains insufficient translation components. Check JSON format.");
        return;
    }

    shuffleArray(quizData);
   
    // Ограничиваем количество вопросов до 10 штук за раунд
    quizData = quizData.slice(0, Math.min(TOTAL_QUESTIONS_PER_RUN, quizData.length));
    currentQuestionIndex = 0;
    score = 0;
   
    switchView("quiz-screen");
    renderQuestion();
}

// Вывод вопроса на экран
function renderQuestion() {
    document.getElementById("feedback-panel").classList.add("hidden");
    const mapping = schemaMappings[currentDatasetName];
    const currentQuestion = quizData[currentQuestionIndex];
   
    document.getElementById("quiz-title").textContent = mapping.displayTitle;
    document.getElementById("quiz-progress").textContent = `Examination ${currentQuestionIndex + 1} / ${quizData.length}`;
    document.getElementById("question-word").textContent = currentQuestion.word;

    // Собираем варианты ответов (1 правильный + до 3 неправильных)
    const choices = [currentQuestion.definition];
    const alternatePool = quizData.map(item => item.definition);
    const dynamicDistractors = [...new Set(alternatePool)].filter(def => def !== currentQuestion.definition);
    shuffleArray(dynamicDistractors);

    for (let i = 0; i < Math.min(3, dynamicDistractors.length); i++) {
        choices.push(dynamicDistractors[i]);
    }

    // Если слов в базе мало, добиваем заглушками
    while (choices.length < 4) {
        choices.push(`Alternative Translation ${choices.length}`);
    }

    shuffleArray(choices);

    const optionsContainer = document.getElementById("options-container");
    optionsContainer.innerHTML = "";

    choices.forEach(choice => {
        const button = document.createElement("button");
        button.className = "option-btn";
        button.textContent = choice;
        button.onclick = () => evaluateAnswer(button, choice, currentQuestion.definition);
        optionsContainer.appendChild(button);
    });
}

// Проверка клика
function evaluateAnswer(selectedButton, chosenValue, correctValue) {
    const buttons = document.getElementById("options-container").getElementsByClassName("option-btn");

    for (let btn of buttons) {
        btn.disabled = true;
        if (btn.textContent === correctValue) {
            btn.classList.add("correct");
        }
    }

    const feedbackMessage = document.getElementById("feedback-message");
    if (chosenValue === correctValue) {
        score++;
        selectedButton.classList.add("correct");
        feedbackMessage.textContent = "Veritas. Your translation aligns precisely.";
        feedbackMessage.style.color = "#243324";
    } else {
        selectedButton.classList.add("wrong");
        feedbackMessage.textContent = `Erroneous. The appropriate rendering is "${correctValue}".`;
        feedbackMessage.style.color = "var(--crimson-border)";
    }

    document.getElementById("feedback-panel").classList.remove("hidden");
}

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < quizData.length) {
        renderQuestion();
    } else {
        displayFinalResults();
    }
}

function displayFinalResults() {
    switchView("results-screen");
    document.getElementById("final-score").textContent = `${score} / ${quizData.length}`;
    const calculationRatio = score / quizData.length;
    let appraisalString = "";

    if (calculationRatio === 1) appraisalString = "Magnificum! Absolute mastery of the forgotten codex.";
    else if (calculationRatio >= 0.7) appraisalString = "Laudable competency. The archives yield to your diligence.";
    else appraisalString = "Sub-optimal retention. Scholarly remediation is requested.";

    document.getElementById("evaluation-text").textContent = appraisalString;
}

function resetQuiz() {
    switchView("setup-screen");
}

function switchView(targetScreenId) {
    ["setup-screen", "quiz-screen", "results-screen"].forEach(id => {
        document.getElementById(id).classList.remove("active");
    });
    document.getElementById(targetScreenId).classList.add("active");
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

