const express = require('express');
const router = express.Router();
const MemoryController = require('../controller/memory');

// Route to get academic info of logged-in user
router.get('/academic', MemoryController.getAcademicInfo);

// Route to get dropdown filter options
router.get('/options', MemoryController.getFilterOptions);

// Route to filter alumni based on institute, batch, course
router.post('/filter', MemoryController.filterAlumni);

module.exports = router;
