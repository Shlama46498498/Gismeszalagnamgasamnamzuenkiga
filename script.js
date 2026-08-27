// Antiquarium Quiz Logic Controller
let quizData = [];
let currentQuestionIndex = 0;
let score = 0;
let currentDatasetName = "";
const TOTAL_QUESTIONS_PER_RUN = 10;

// Config schema adjustments to digest uneven variables across data catalogs seamlessly
const schemaMappings = {
    "assyrian_akkadian": { wordKey: "assyrian", definitionKey: "akkadian", displayTitle: "Assyrian - Akkadian Archive" },
    "assyrian_russian": { wordKey: "word", definitionKey: "translation", displayTitle: "Assyrian - Russian Codex" },
    "english_greek": { wordKey: "english", definitionKey: "greek", displayTitle: "English - Greek Compendium" },
    "latin_english": { wordKey: "latin", definitionKey: "english", displayTitle: "Latin - English Folio" }
};

// Request designated data package via relative directory access
async function selectDataset(datasetId) {
    currentDatasetName = datasetId;
    try {
        const response = await fetch(`data/${datasetId}.json`);
        if (!response.ok) throw new Error(`HTTP Error: Failed to secure ${datasetId}.json`);
        const rawData = await response.json();
        prepareQuizPool(rawData);
    } catch (error) {
        console.error("Archive Retrieval Error:", error);
        alert("Unable to safely access file structure within local data/ folder.");
    }
}

// Convert schema variances cleanly and extract a randomized subset 
function prepareQuizPool(rawArray) {
    const mapping = schemaMappings[currentDatasetName];
    
    // Abstract schema variants cleanly out of database structure arrays
    quizData = rawArray.map(item => ({
        word: item[mapping.wordKey] || "Unknown",
        definition: item[mapping.definitionKey] || "Missing"
    })).filter(item => item.word !== "Unknown" && item.definition !== "Missing");

    if (quizData.length < 4) {
        alert("The collection pool contains insufficient translation components.");
        return;
    }

    shuffleArray(quizData);
    
    // Sample configuration settings bounds
    quizData = quizData.slice(0, Math.min(TOTAL_QUESTIONS_PER_RUN, quizData.length));
    currentQuestionIndex = 0;
    score = 0;
    
    switchView("quiz-screen");
    renderQuestion();
}

// Layout current evaluation query
function renderQuestion() {
    document.getElementById("feedback-panel").classList.add("hidden");
    const mapping = schemaMappings[currentDatasetName];
    const currentQuestion = quizData[currentQuestionIndex];
    
    document.getElementById("quiz-title").textContent = mapping.displayTitle;
    document.getElementById("quiz-progress").textContent = `Examination ${currentQuestionIndex + 1} / ${quizData.length}`;
    document.getElementById("question-word").textContent = currentQuestion.word;

    // Collect choices and shuffle alternative elements to isolate dynamic entries
    const choices = [currentQuestion.definition];
    const alternatePool = quizData.map(item => item.definition);
    const dynamicDistractors = [...new Set(alternatePool)].filter(def => def !== currentQuestion.definition);
    shuffleArray(dynamicDistractors);

    for (let i = 0; i < Math.min(3, dynamicDistractors.length); i++) {
        choices.push(dynamicDistractors[i]);
    }

    // Safety fallback buffer padding loop if pool runs lean
    while (choices.length < 4) {
        choices.push(`Alternative Translation Variant ${choices.length}`);
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

// Handle choices selection validation logic
function evaluateAnswer(selectedButton, chosenValue, correctValue) {
    const buttons = document.getElementById("options-container").getElementsByClassName("option-btn");

    // Lock dynamic actions loop execution triggers
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

// Advance loop execution or transition view layouts
function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < quizData.length) {
        renderQuestion();
    } else {
        displayFinalResults();
    }
}

// Deliver dynamic contextual end reviews
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

// Knuth-Fisher-Yates implementation formula block
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

