const express = require('express');
const router = express.Router();
const {
    createNews,
    getPublishedNews,
    updateNews,
    deleteNews,
    publishNews,
    searchNews,
} = require('../controllers/Controller');
const upload = require('../middlewares/upload');

// Read
router.get('/', getPublishedNews);

// Create (with Image)
router.post('/', upload.single('thumbnail'), createNews);

// Update (with Image)
router.put('/:id', upload.single('thumbnail'), updateNews);

// ONLY update the published status
router.patch('/:id/publish', publishNews);

// Get the news according to the searched titles
router.get("/search", searchNews);

// Delete
router.delete('/:id', deleteNews);

module.exports = router;