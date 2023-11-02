const loginForm = document.getElementById("login-form");
loginForm.addEventListener("submit", handleSubmit);

function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);

    const email = formData.get("email");
    const password = formData.get("password");
    login({ email, password });
}

async function login(creds) {
    const res = await fetch("http://localhost:5678/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(creds),
    });

    if (!res.ok) {
        const form = document.getElementById("login-form");
        const span = document.createElement("span");
        span.id = "login-error";
        span.innerText = "Mot de passe / identifiant invalide";
        form.insertBefore(span, form.childNodes[8]);
        return;
    }

    const data = await res.json();
    sessionStorage.setItem("token", data.token);
    window.location = "./index.html";
}
