const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const app = express();

const users = []; // In-memory array to store registered users (for demo purposes)

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Set up session management
app.use(session({
    secret: 'your_secret_key', // Replace with a strong secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Middleware to protect routes
function checkAuth(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

// Serve the index page after login, but only if authenticated
app.get('/', checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Serve the login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'));
});

// Handle login
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        req.session.user = user; // Store user info in session
        res.redirect('/');
    } else {
        res.send('Invalid credentials. <a href="/login">Try again</a>');
    }
});

// Serve the register page
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/register.html'));
});

// Handle registration
app.post('/register', (req, res) => {
    const { email, password } = req.body;

    // Check if the user already exists
    if (users.find(u => u.email === email)) {
        res.send('User already exists. <a href="/register">Try again</a>');
    } else {
        users.push({ email, password });
        res.redirect('/login');
    }
});

// Handle logout
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.send('Error logging out.');
        }
        res.redirect('/login'); // Redirect to the login page
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
