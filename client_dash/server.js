const express = require('express');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3000;

// Set storage engine
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Init upload
const upload = multer({
    storage: storage
}).single('adImage');

// Set static folder
app.use(express.static('public'));

// Body parser middleware
app.use(express.urlencoded({ extended: false }));

// Home route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle file upload
app.post('/upload', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            res.send('Error uploading file');
        } else {
            res.send('File uploaded successfully');
        }
    });
});

app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});
