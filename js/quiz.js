// =====================================
// QUESTION ARRAY
// =====================================

let questions = [];


// =====================================
// ADD QUESTION
// =====================================

function addQuestion() {

    const questionText =
        document.getElementById("questionText");

    const option1 =
        document.getElementById("option1");

    const option2 =
        document.getElementById("option2");

    const option3 =
        document.getElementById("option3");

    const option4 =
        document.getElementById("option4");

    const correctAnswer =
        document.getElementById("correctAnswer");


    if (
        !questionText ||
        !option1 ||
        !option2 ||
        !option3 ||
        !option4 ||
        !correctAnswer
    ) {
        return;
    }


    const question =
        questionText.value.trim();

    const op1 =
        option1.value.trim();

    const op2 =
        option2.value.trim();

    const op3 =
        option3.value.trim();

    const op4 =
        option4.value.trim();

    const correct =
        correctAnswer.value;


    // =================================
    // VALIDATE QUESTION
    // =================================

    if (
        question === "" ||
        op1 === "" ||
        op2 === "" ||
        op3 === "" ||
        op4 === "" ||
        correct === ""
    ) {

        alert("Please fill all question fields.");

        return;

    }


    // =================================
    // CREATE QUESTION OBJECT
    // =================================

    const newQuestion = {

        question: question,

        options: [
            op1,
            op2,
            op3,
            op4
        ],

        // 0 = Option 1
        // 1 = Option 2
        // 2 = Option 3
        // 3 = Option 4

        correctAnswer: parseInt(correct)

    };


    // =================================
    // ADD QUESTION
    // =================================

    questions.push(newQuestion);


    // =================================
    // DISPLAY QUESTIONS
    // =================================

    displayQuestions();


    // =================================
    // CLEAR INPUTS
    // =================================

    questionText.value = "";

    option1.value = "";

    option2.value = "";

    option3.value = "";

    option4.value = "";

    correctAnswer.value = "";

}


// =====================================
// DISPLAY QUESTIONS
// =====================================

function displayQuestions() {

    const questionList =
        document.getElementById("questionList");


    if (!questionList) {
        return;
    }


    questionList.innerHTML = "";


    questions.forEach(
        function (question, index) {

            const questionCard =
                document.createElement("div");


            questionCard.className =
                "question-card";


            questionCard.innerHTML = `

                <h4>
                    Question ${index + 1}
                </h4>

                <p>
                    ${question.question}
                </p>

                <ol>

                    <li>
                        ${question.options[0]}
                    </li>

                    <li>
                        ${question.options[1]}
                    </li>

                    <li>
                        ${question.options[2]}
                    </li>

                    <li>
                        ${question.options[3]}
                    </li>

                </ol>

                <p>
                    Correct Answer:
                    Option
                    ${question.correctAnswer + 1}
                </p>

            `;


            questionList.appendChild(questionCard);

        }
    );

}


// =====================================
// SAVE QUIZ
// =====================================

function saveQuiz() {

    const titleElement =
        document.getElementById("quizTitle");

    const descriptionElement =
        document.getElementById("quizDescription");


    if (
        !titleElement ||
        !descriptionElement
    ) {
        return;
    }


    const title =
        titleElement.value.trim();

    const description =
        descriptionElement.value.trim();


    // =================================
    // VALIDATION
    // =================================

    if (title === "") {

        alert("Please enter quiz title.");

        return;

    }


    if (description === "") {

        alert("Please enter quiz description.");

        return;

    }


    if (questions.length === 0) {

        alert("Please add at least one question.");

        return;

    }


    // =================================
    // GET EXISTING QUIZZES
    // =================================

    const quizzes =
        JSON.parse(
            localStorage.getItem("quizzes")
        ) || [];


    // =================================
    // CREATE QUIZ OBJECT
    // =================================

    const quiz = {

        id: Date.now(),

        title: title,

        description: description,

        questions: questions

    };


    // =================================
    // SAVE QUIZ
    // =================================

    quizzes.push(quiz);


    localStorage.setItem(
        "quizzes",
        JSON.stringify(quizzes)
    );


    alert("Quiz saved successfully!");


    // =================================
    // GO TO ADMIN DASHBOARD
    // =================================

    window.location.href =
        "admin.html";

}


// =====================================
// LOAD SELECTED QUIZ
// =====================================

function loadSelectedQuiz() {

    const quizTitle =
        document.getElementById("quizTitle");

    const quizDescription =
        document.getElementById("quizDescription");

    const quizQuestions =
        document.getElementById("quizQuestions");


    if (!quizQuestions) {
        return;
    }


    const selectedQuizId =
        localStorage.getItem("selectedQuizId");


    if (!selectedQuizId) {

        quizQuestions.innerHTML =
            "<p>No quiz selected.</p>";

        return;

    }


    const quizzes =
        JSON.parse(
            localStorage.getItem("quizzes")
        ) || [];


    const quiz =
        quizzes.find(
            function (item) {

                return String(item.id) ===
                    String(selectedQuizId);

            }
        );


    if (!quiz) {

        quizQuestions.innerHTML =
            "<p>Quiz not found.</p>";

        return;

    }


    // =================================
    // DISPLAY QUIZ TITLE
    // =================================

    if (quizTitle) {

        quizTitle.innerText =
            quiz.title;

    }


    // =================================
    // DISPLAY DESCRIPTION
    // =================================

    if (quizDescription) {

        quizDescription.innerText =
            quiz.description;

    }


    // =================================
    // DISPLAY QUESTIONS
    // =================================

    quizQuestions.innerHTML = "";


    quiz.questions.forEach(
        function (question, index) {

            const questionDiv =
                document.createElement("div");


            questionDiv.className =
                "question-card";


            let optionsHTML = "";


            question.options.forEach(
                function (option, optionIndex) {

                    optionsHTML += `

                        <label class="quiz-option">

                            <input
                                type="radio"
                                name="question${index}"
                                value="${optionIndex}"
                            >

                            ${option}

                        </label>

                    `;

                }
            );


            questionDiv.innerHTML = `

                <h3>
                    ${index + 1}.
                    ${question.question}
                </h3>

                <div>
                    ${optionsHTML}
                </div>

            `;


            quizQuestions.appendChild(
                questionDiv
            );

        }
    );

}


// =====================================
// SUBMIT QUIZ
// =====================================

function submitQuiz() {

    const selectedQuizId =
        localStorage.getItem("selectedQuizId");


    if (!selectedQuizId) {

        alert("No quiz selected.");

        return;

    }


    const quizzes =
        JSON.parse(
            localStorage.getItem("quizzes")
        ) || [];


    const quiz =
        quizzes.find(
            function (item) {

                return String(item.id) ===
                    String(selectedQuizId);

            }
        );


    if (!quiz) {

        alert("Quiz not found.");

        return;

    }


    let score = 0;


    // =================================
    // CHECK ANSWERS
    // =================================

    quiz.questions.forEach(
        function (question, index) {

            const selected =
                document.querySelector(
                    `input[name="question${index}"]:checked`
                );


            if (
                selected &&
                parseInt(selected.value) ===
                parseInt(question.correctAnswer)
            ) {

                score++;

            }

        }
    );


    // =================================
    // GET LOGGED-IN USER
    // =================================

    const loggedInUser =
        JSON.parse(
            localStorage.getItem("loggedInUser")
        );


    if (!loggedInUser) {

        alert("Please login first.");

        window.location.href =
            "login.html";

        return;

    }


    // =================================
    // CREATE RESULT
    // =================================

    const result = {

        id: Date.now(),

        userName:
            loggedInUser.name,

        userEmail:
            loggedInUser.email,

        quizTitle:
            quiz.title,

        score:
            score,

        totalQuestions:
            quiz.questions.length,

        date:
            new Date().toLocaleString()

    };


    // =================================
    // GET OLD RESULTS
    // =================================

    const results =
        JSON.parse(
            localStorage.getItem("results")
        ) || [];


    // =================================
    // SAVE RESULT
    // =================================

    results.push(result);


    localStorage.setItem(
        "results",
        JSON.stringify(results)
    );


    // =================================
    // SAVE CURRENT SCORE
    // =================================

    localStorage.setItem(
        "currentScore",
        JSON.stringify(result)
    );


    // =================================
    // GO TO RESULTS PAGE
    // =================================

    window.location.href =
        "results.html";

}


// =====================================
// GO TO USER DASHBOARD
// =====================================

function goToUserDashboard() {

    window.location.href =
        "user.html";

}


// =====================================
// GO TO ADMIN DASHBOARD
// =====================================

function goToAdmin() {

    window.location.href =
        "admin.html";

}


// =====================================
// LOGOUT
// =====================================

function logout() {

    localStorage.removeItem(
        "loggedInUser"
    );


    window.location.href =
        "index.html";

}


// =====================================
// DISPLAY RESULT
// =====================================

function displayResult() {

    const result =
        JSON.parse(
            localStorage.getItem("currentScore")
        );


    if (!result) {
        return;
    }


    const resultContainer =
        document.getElementById(
            "resultContainer"
        );


    if (resultContainer) {

        resultContainer.innerHTML = `

            <div class="result-box">

                <h2>
                    Quiz Result
                </h2>

                <p>

                    <strong>
                        Quiz:
                    </strong>

                    ${result.quizTitle}

                </p>

                <p>

                    <strong>
                        Student:
                    </strong>

                    ${result.userName}

                </p>

                <p>

                    <strong>
                        Score:
                    </strong>

                    ${result.score}
                    /
                    ${result.totalQuestions}

                </p>

                <p>

                    <strong>
                        Date:
                    </strong>

                    ${result.date}

                </p>

            </div>

        `;

    }

}


// =====================================
// PAGE LOAD FUNCTIONS
// =====================================

if (
    document.getElementById(
        "quizQuestions"
    )
) {

    loadSelectedQuiz();

}


if (
    document.getElementById(
        "resultContainer"
    )
) {

    displayResult();

}