export function signup(username, email, password) {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    
    const userExists = users.find(u => u.email === email);
    if (userExists) {
        alert("Email is already registered!");
        return false;
    }

    users.push({ username, email, password });
    localStorage.setItem('users', JSON.stringify(users));
    alert("Signup successful! You can now log in.");
    return true;
}

export function login(email, password) {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        const currentUser = { username: user.username, email: user.email };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        return true;
    } else {
        alert("Invalid email or password!");
        return false;
    }
}

export function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

export function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = "Login.html";
}