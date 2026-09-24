// =====================================
// CHECK USER LOGIN
// =====================================

const loggedInUser =
    JSON.parse(
        localStorage.getItem("loggedInUser")
    );


// =====================================
// REDIRECT IF NOT LOGGED IN
// =====================================

if (!loggedInUser) {

    window.location.href =
        "login.html";

}


// =====================================
// CHECK USER ROLE
// =====================================

if (
    loggedInUser &&
    loggedInUser.role !== "user"
) {

    window.location.href =
        "admin.html";

}


// =====================================
// DISPLAY WELCOME MESSAGE
// =====================================

if (loggedInUser) {

    const welcomeMessage =
        document.getElementById(
            "welcomeMessage"
        );

    if (welcomeMessage) {

        welcomeMessage.innerText =
            "Welcome, " +
            loggedInUser.name +
            "!";

    }
}


// =====================================
// LOAD QUIZZES
// =====================================

function loadQuizzes() {

    const quizContainer =
        document.getElementById(
            "quizContainer"
        );

    if (!quizContainer) {

        return;

    }

    const quizzes =
        JSON.parse(
            localStorage.getItem("quizzes")
        ) || [];

    quizContainer.innerHTML = "";


    // =================================
    // CHECK WHETHER QUIZZES EXIST
    // =================================

    if (quizzes.length === 0) {

        quizContainer.innerHTML = `

            <div class="card">

                <h3>
                    No Quizzes Available
                </h3>

                <p>
                    The administrator has not created
                    any quizzes yet.
                </p>

            </div>

        `;

        return;
    }


    // =================================
    // DISPLAY ALL QUIZZES
    // =================================

    quizzes.forEach(
        function (quiz) {

            const quizCard =
                document.createElement(
                    "div"
                );

            quizCard.className =
                "card";

            quizCard.innerHTML = `

                <h3>
                    ${quiz.title}
                </h3>

                <p>
                    ${quiz.description}
                </p>

                <p>
                    Questions:
                    ${quiz.questions.length}
                </p>

                <button
                    onclick="attemptQuiz(${quiz.id})"
                >
                    Attempt Quiz
                </button>

            `;

            quizContainer.appendChild(
                quizCard
            );

        }
    );

}


// =====================================
// ATTEMPT QUIZ
// =====================================

function attemptQuiz(quizId) {

    localStorage.setItem(
        "selectedQuizId",
        quizId
    );

    window.location.href =
        "attempt-quiz.html";

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
// LOAD QUIZZES WHEN PAGE OPENS
// =====================================

loadQuizzes();