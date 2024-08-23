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
    saveUninitialized: false, // Don't save uninitialized sessions
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Redirect to login page if not authenticated
app.get('/', (req, res) => {
    if (!req.session.user) {
        // If no user session exists, redirect to login
        res.redirect('/login');
    } else {
        // If user session exists, redirect to home/dashboard
        res.redirect('/home');
    }
});


// Middleware to protect routes
function checkAuth(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

// Root route: redirect to login page if not authenticated
app.get('/', (req, res) => {
    if (!req.session.user) {
        // Redirect to login page if no user session exists
        res.redirect('/login');
    } else {
        // Redirect to home page if the user session exists
        res.redirect('/home');
    }
});

// Serve the login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'));
});

// Serve the home/dashboard page after login, but only if authenticated
app.get('/home', checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Handle login
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        req.session.user = user; // Store user info in session
        res.redirect('/home'); // Redirect to the home/dashboard page
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
        res.redirect('/login'); // Redirect to login after successful registration
    }
});

// Handle logout
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.send('Error logging out.');
        }
        res.redirect('/login'); // Redirect to the login page after logout
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
