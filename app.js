require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const router = require('./src/routes/index');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder to serve uploaded images (saves the image in the uploads folder)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api', router);

app.get('/', (req, res) => {
    res.send('Mini Project 2 API is running');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});