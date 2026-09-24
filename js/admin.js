// =====================================
// CHECK ADMIN LOGIN
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
// CHECK ADMIN ROLE
// =====================================

if (
    loggedInUser &&
    loggedInUser.role !== "admin"
) {

    window.location.href =
        "user.html";

}


// =====================================
// GO TO CREATE QUIZ
// =====================================

function goToCreateQuiz() {

    window.location.href =
        "create-quiz.html";

}


// =====================================
// VIEW QUIZZES
// =====================================

function viewQuizzes() {

    const quizzes =
        JSON.parse(
            localStorage.getItem("quizzes")
        ) || [];

    if (quizzes.length === 0) {

        alert(
            "No quizzes have been created yet."
        );

        return;
    }

    let message =
        "Created Quizzes:\n\n";

    quizzes.forEach(
        function (quiz, index) {

            message +=
                (index + 1) +
                ". " +
                quiz.title +
                " - " +
                quiz.questions.length +
                " questions\n";

        }
    );

    alert(message);

}


// =====================================
// VIEW RESULTS
// =====================================

function viewResults() {

    const results =
        JSON.parse(
            localStorage.getItem("results")
        ) || [];

    if (results.length === 0) {

        alert(
            "No quiz results available yet."
        );

        return;
    }

    let message =
        "Quiz Results:\n\n";

    results.forEach(
        function (result, index) {

            message +=
                (index + 1) +
                ". " +
                result.userName +
                " - " +
                result.quizTitle +
                " - Score: " +
                result.score +
                "/" +
                result.totalQuestions +
                "\n";

        }
    );

    alert(message);

}


// =====================================
// VIEW USERS
// =====================================

function viewUsers() {

    const users =
        JSON.parse(
            localStorage.getItem("users")
        ) || [];

    if (users.length === 0) {

        alert(
            "No users registered."
        );

        return;
    }

    let message =
        "Registered Users:\n\n";

    users.forEach(
        function (user, index) {

            message +=
                (index + 1) +
                ". " +
                user.name +
                " - " +
                user.email +
                " - " +
                user.role +
                "\n";

        }
    );

    alert(message);

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