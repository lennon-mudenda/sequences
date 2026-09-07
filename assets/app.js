
const select = document.getElementById("exampleSelect");
const codeElement = document.getElementById("code");
const variablesElement = document.getElementById("variables");
const explanationElement = document.getElementById("explanation");
const iterationElement = document.getElementById("iteration");
const visualElement = document.getElementById("visual");
const outputElement = document.getElementById("output");
const progressElement = document.getElementById("progress");
const progressLabel = document.getElementById("progressLabel");
const heroMode = document.getElementById("heroMode");
const heroSteps = document.getElementById("heroSteps");
const heroProgress = document.getElementById("heroProgress");
const summaryExample = document.getElementById("summaryExample");
const summaryStep = document.getElementById("summaryStep");
const summaryFocus = document.getElementById("summaryFocus");

const previousBtn = document.getElementById("previousBtn");
const nextBtn = document.getElementById("nextBtn");
const resetBtn = document.getElementById("resetBtn");
const playBtn = document.getElementById("playBtn");

const practiceTitle = document.getElementById("practiceTitle");
const practicePrompt = document.getElementById("practicePrompt");
const practiceCode = document.getElementById("practiceCode");
const answerBox = document.getElementById("answerBox");
const answerExplanation = document.getElementById("answerExplanation");
const answerCode = document.getElementById("answerCode");

const timerDisplay = document.getElementById("timerDisplay");
const timeValue = document.getElementById("timeValue");
const minusTimeBtn = document.getElementById("minusTimeBtn");
const plusTimeBtn = document.getElementById("plusTimeBtn");
const startPracticeBtn = document.getElementById("startPracticeBtn");
const revealAnswerBtn = document.getElementById("revealAnswerBtn");
const resetPracticeBtn = document.getElementById("resetPracticeBtn");
const practiceNote = document.getElementById("practiceNote");

const controls = [
    select,
    previousBtn,
    nextBtn,
    resetBtn,
    playBtn,
    minusTimeBtn,
    plusTimeBtn,
    startPracticeBtn,
    revealAnswerBtn,
    resetPracticeBtn
];

let examples = {};
let exampleOrder = [];
let currentExample;
let steps = [];
let currentStep = -1;
let previousVariables = {};
let timer = null;

let practiceDuration = 60;
let practiceRemaining = 60;
let practiceTimer = null;
let practiceRunning = false;

const MIN_PRACTICE_TIME = 30;
const MAX_PRACTICE_TIME = 600;
const PRACTICE_INCREMENT = 30;

function setControlsDisabled(disabled) {
    controls.forEach((control) => {
        control.disabled = disabled;
    });
}

function normaliseSimulations(data) {
    if (!data || !Array.isArray(data.simulations) || data.simulations.length === 0) {
        throw new Error("No simulations were found in simulations.json.");
    }

    const map = {};
    const order = [];

    data.simulations.forEach((simulation) => {
        if (!simulation.id || !simulation.label) {
            throw new Error("Each simulation needs an id and label.");
        }

        map[simulation.id] = {
            ...simulation,
            code: Array.isArray(simulation.code) ? simulation.code : [],
            steps: Array.isArray(simulation.steps) ? simulation.steps : [],
            sequence: Array.isArray(simulation.sequence) ? simulation.sequence : [],
            grid: Boolean(simulation.grid)
        };

        order.push(simulation.id);
    });

    return { map, order };
}

function populateExampleSelect() {
    select.innerHTML = "";

    exampleOrder.forEach((id) => {
        const option = document.createElement("option");
        option.value = id;
        option.textContent = examples[id].label;
        select.appendChild(option);
    });
}

function renderLoadError(message) {
    setControlsDisabled(true);
    codeElement.innerHTML = "";
    variablesElement.innerHTML = "";
    visualElement.innerHTML = "";
    outputElement.textContent = "Unable to load simulation data.";
    iterationElement.textContent = "Load error";
    explanationElement.textContent = message;
    progressElement.style.width = "0%";
    progressLabel.textContent = "0%";
    practiceTitle.textContent = "Practice unavailable";
    practicePrompt.textContent = message;
    practiceCode.textContent = "";
    practiceNote.textContent = "Check simulations.json and reload the page.";
    answerExplanation.textContent = "";
    answerCode.textContent = "";
    answerBox.classList.add("hidden");
    summaryExample.textContent = "Unavailable";
    summaryStep.textContent = "0 / 0";
    summaryFocus.textContent = "Load error";
    heroMode.textContent = "Unavailable";
    heroSteps.textContent = "0";
    heroProgress.textContent = "Error";
}

function getExampleLabel() {
    const selectedOption = select.options[select.selectedIndex];
    return selectedOption ? selectedOption.textContent.replace(" — ", ": ") : "Lesson";
}

function updateLessonSummary() {
    const label = getExampleLabel();

    heroMode.textContent = label;
    summaryExample.textContent = label;
    heroSteps.textContent = String(steps.length);

    if (currentStep < 0) {
        summaryStep.textContent = `0 / ${steps.length}`;
        summaryFocus.textContent = "Waiting";
        heroProgress.textContent = "Ready";
        progressLabel.textContent = "0%";
        return;
    }

    const percentage = Math.round(((currentStep + 1) / steps.length) * 100);
    summaryStep.textContent = `${currentStep + 1} / ${steps.length}`;
    summaryFocus.textContent = steps[currentStep].iteration;
    heroProgress.textContent = `${percentage}%`;
    progressLabel.textContent = `${percentage}%`;
}

function loadExample() {
    stopAutoPlay();
    resetPractice();

    currentExample = examples[select.value];
    steps = currentExample.steps;

    currentStep = -1;
    previousVariables = {};

    renderCode();

    variablesElement.innerHTML = "";
    outputElement.textContent = "Waiting...";
    explanationElement.textContent = "Press Next Step to begin.";
    iterationElement.textContent = "Ready";
    progressElement.style.width = "0%";

    renderVisual(null);
    renderPractice();
    updateLessonSummary();
}

function renderCode(activeLine = null) {
    codeElement.innerHTML = "";

    currentExample.code.forEach((line, index) => {
        const row = document.createElement("div");
        row.className = "code-line";

        if (index + 1 === activeLine) {
            row.classList.add("active");
        }

        const lineNumber = document.createElement("span");
        lineNumber.className = "line-number";
        lineNumber.textContent = index + 1;

        const codeText = document.createElement("span");
        codeText.textContent = line || " ";

        row.appendChild(lineNumber);
        row.appendChild(codeText);
        codeElement.appendChild(row);
    });
}

function showStep(index) {
    if (index < 0 || index >= steps.length) return;

    currentStep = index;
    const step = steps[currentStep];

    renderCode(step.line);
    iterationElement.textContent = step.iteration;
    explanationElement.textContent = step.explanation;

    renderVariables(step.vars);
    renderVisual(step);

    outputElement.textContent = step.output || "No console output yet.";

    const percentage = ((currentStep + 1) / steps.length) * 100;
    progressElement.style.width = percentage + "%";
    updateLessonSummary();
}

function renderVariables(vars) {
    variablesElement.innerHTML = "";

    Object.entries(vars).forEach(([name, value]) => {
        const card = document.createElement("div");
        card.className = "variable";

        if (
            previousVariables[name] !== undefined &&
            previousVariables[name] !== value
        ) {
            card.classList.add("changed");
        }

        const nameElement = document.createElement("div");
        nameElement.className = "variable-name";
        nameElement.textContent = name;

        const valueElement = document.createElement("div");
        valueElement.className = "variable-value";
        valueElement.textContent = value;

        card.appendChild(nameElement);
        card.appendChild(valueElement);
        variablesElement.appendChild(card);
    });

    previousVariables = { ...vars };
}

function renderVisual(step) {
    visualElement.innerHTML = "";

    if (currentExample.grid) {
        renderGrid(step);
        return;
    }

    const sequence = document.createElement("div");
    sequence.className = "sequence";

    currentExample.sequence.forEach((value, index) => {
        const item = document.createElement("div");
        item.className = "sequence-item";
        item.textContent = value;

        if (step) {
            if (index === step.current) {
                item.classList.add("current");
            }

            if (index < step.current) {
                item.classList.add("complete");
            }
        }

        sequence.appendChild(item);
    });

    visualElement.appendChild(sequence);
}

function renderGrid(step) {
    const grid = document.createElement("div");
    grid.className = "grid-visual";

    for (let row = 1; row <= 3; row++) {
        for (let column = 1; column <= 4; column++) {
            const cell = document.createElement("div");
            cell.className = "grid-cell";

            const product = row * column;
            cell.textContent = product;

            if (step) {
                const cellNumber = (row - 1) * 4 + column;
                const currentNumber = (step.row - 1) * 4 + step.column;

                if (row === step.row && column === step.column) {
                    cell.classList.add("current");

                    if (step.match === true) {
                        cell.classList.add("match");
                    }

                    if (step.match === false) {
                        cell.classList.add("reject");
                    }
                }

                if (step.column && cellNumber < currentNumber) {
                    if (product % 2 === 0) {
                        cell.classList.add("match");
                    } else {
                        cell.classList.add("reject");
                    }
                }
            }

            grid.appendChild(cell);
        }
    }

    visualElement.appendChild(grid);
}

function renderPractice() {
    const practice = currentExample.practice;

    practiceTitle.textContent = practice.title;
    practicePrompt.textContent = practice.prompt;
    practiceCode.textContent = practice.code;
    answerExplanation.textContent = practice.explanation;
    answerCode.textContent = practice.answer;

    answerBox.classList.add("hidden");
    revealAnswerBtn.disabled = true;

    updatePracticeDisplay();

    practiceNote.textContent =
        "Set the time in 30-second increments, then start the practice question.";
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function updatePracticeDisplay() {
    timerDisplay.textContent = formatTime(practiceRemaining);
    timeValue.textContent = `${practiceDuration} sec`;

    timerDisplay.classList.remove("warning", "finished");

    if (practiceRunning && practiceRemaining <= 10 && practiceRemaining > 0) {
        timerDisplay.classList.add("warning");
    }

    if (practiceRemaining === 0) {
        timerDisplay.classList.add("finished");
    }

    minusTimeBtn.disabled = practiceRunning || practiceDuration <= MIN_PRACTICE_TIME;
    plusTimeBtn.disabled = practiceRunning || practiceDuration >= MAX_PRACTICE_TIME;
}

function changePracticeTime(amount) {
    if (practiceRunning) return;

    practiceDuration = Math.min(
        MAX_PRACTICE_TIME,
        Math.max(MIN_PRACTICE_TIME, practiceDuration + amount)
    );

    practiceRemaining = practiceDuration;
    updatePracticeDisplay();
}

function startPractice() {
    if (practiceTimer) {
        clearInterval(practiceTimer);
    }

    answerBox.classList.add("hidden");

    practiceRemaining = practiceDuration;
    practiceRunning = true;

    startPracticeBtn.disabled = true;
    revealAnswerBtn.disabled = false;

    practiceNote.textContent =
        "Practice has started. Trace the code before revealing the answer.";

    updatePracticeDisplay();

    practiceTimer = setInterval(() => {
        practiceRemaining -= 1;

        if (practiceRemaining <= 0) {
            practiceRemaining = 0;
            finishPracticeTimer();
        }

        updatePracticeDisplay();
    }, 1000);
}

function finishPracticeTimer() {
    if (practiceTimer) {
        clearInterval(practiceTimer);
        practiceTimer = null;
    }

    practiceRunning = false;
    startPracticeBtn.disabled = false;
    revealAnswerBtn.disabled = false;

    practiceNote.textContent =
        "Time is up. Compare your working with the answer.";

    revealAnswer();
}

function revealAnswer() {
    answerBox.classList.remove("hidden");

    if (practiceRunning) {
        practiceNote.textContent =
            "Answer revealed. You can still use the remaining time to compare your working.";
    }
}

function resetPractice() {
    if (practiceTimer) {
        clearInterval(practiceTimer);
        practiceTimer = null;
    }

    practiceRunning = false;
    practiceRemaining = practiceDuration;

    startPracticeBtn.disabled = false;
    revealAnswerBtn.disabled = true;

    if (answerBox) {
        answerBox.classList.add("hidden");
    }

    if (practiceNote) {
        practiceNote.textContent =
            "Set the time in 30-second increments, then start the practice question.";
    }

    updatePracticeDisplay();
}

nextBtn.addEventListener("click", () => {
    if (currentStep < steps.length - 1) {
        showStep(currentStep + 1);
    } else {
        stopAutoPlay();
    }
});

previousBtn.addEventListener("click", () => {
    stopAutoPlay();

    if (currentStep > 0) {
        showStep(currentStep - 1);
    }
});

resetBtn.addEventListener("click", loadExample);
select.addEventListener("change", loadExample);

playBtn.addEventListener("click", () => {
    if (timer) {
        stopAutoPlay();
        return;
    }

    playBtn.textContent = "⏸ Pause";

    timer = setInterval(() => {
        if (currentStep >= steps.length - 1) {
            stopAutoPlay();
            return;
        }

        showStep(currentStep + 1);
    }, 1100);
});

function stopAutoPlay() {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }

    playBtn.textContent = "▶ Auto Play";
}

minusTimeBtn.addEventListener("click", () => {
    changePracticeTime(-PRACTICE_INCREMENT);
});

plusTimeBtn.addEventListener("click", () => {
    changePracticeTime(PRACTICE_INCREMENT);
});

startPracticeBtn.addEventListener("click", startPractice);
revealAnswerBtn.addEventListener("click", revealAnswer);
resetPracticeBtn.addEventListener("click", resetPractice);

async function initialisePage() {
    setControlsDisabled(true);

    try {
        const response = await fetch("assets/simulations.json", { cache: "no-store" });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status} while loading assets/simulations.json.`);
        }

        const data = await response.json();
        const normalised = normaliseSimulations(data);

        examples = normalised.map;
        exampleOrder = normalised.order;

        populateExampleSelect();
        select.value = exampleOrder[0];
        setControlsDisabled(false);
        loadExample();
    } catch (error) {
        console.error("Failed to load assets/simulations.json", error);
        renderLoadError("The page could not load assets/simulations.json. Serve the folder from a local web server and check that the JSON is valid.");
    }
}

initialisePage();
