// =====================================
// GET USERS FROM LOCAL STORAGE
// =====================================

let users =
    JSON.parse(localStorage.getItem("users")) || [];


// =====================================
// CREATE DEFAULT ADMIN ACCOUNT
// =====================================

if (!users.some(user => user.role === "admin")) {

    users.push({

        name: "Administrator",

        email: "admin@gmail.com",

        password: "admin123",

        role: "admin"

    });

    localStorage.setItem(
        "users",
        JSON.stringify(users)
    );
}


// =====================================
// SIGN UP
// =====================================

const signupForm =
    document.getElementById("signupForm");

if (signupForm) {

    signupForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            const name =
                document
                    .getElementById("signupName")
                    .value
                    .trim();

            const email =
                document
                    .getElementById("signupEmail")
                    .value
                    .trim();

            const password =
                document
                    .getElementById("signupPassword")
                    .value;

            let users =
                JSON.parse(
                    localStorage.getItem("users")
                ) || [];

            const existingUser =
                users.find(
                    user =>
                        user.email === email
                );

            if (existingUser) {

                document.getElementById(
                    "signupMessage"
                ).innerText =
                    "Email already registered.";

                return;
            }

            const newUser = {

                name: name,

                email: email,

                password: password,

                role: "user"

            };

            users.push(newUser);

            localStorage.setItem(
                "users",
                JSON.stringify(users)
            );

            document.getElementById(
                "signupMessage"
            ).innerText =
                "Account created successfully!";

            setTimeout(
                function () {

                    window.location.href =
                        "login.html";

                },
                1000
            );
        }
    );
}


// =====================================
// LOGIN
// =====================================

const loginForm =
    document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            const email =
                document
                    .getElementById("loginEmail")
                    .value
                    .trim();

            const password =
                document
                    .getElementById("loginPassword")
                    .value;

            let users =
                JSON.parse(
                    localStorage.getItem("users")
                ) || [];

            const user =
                users.find(
                    user =>
                        user.email === email &&
                        user.password === password
                );

            if (!user) {

                document.getElementById(
                    "loginMessage"
                ).innerText =
                    "Invalid email or password.";

                return;
            }

            localStorage.setItem(
                "loggedInUser",
                JSON.stringify(user)
            );

            if (user.role === "admin") {

                window.location.href =
                    "admin.html";

            } else {

                window.location.href =
                    "user.html";

            }
        }
    );
}