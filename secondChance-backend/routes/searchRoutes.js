const express = require('express');
const router = express.Router();
const connectToDatabase = require('../models/db');

// Search for secondChanceItems
router.get('/', async (req, res, next) => {
    try {
        // ✅ Task 1: Connect to MongoDB
        const db = await connectToDatabase();

        // ✅ Correct Collection Name
        const collection = db.collection("secondChanceItems");

        // Initialize the query object
        let query = {};

        // ✅ Task 2: Add the name filter to the query if the name parameter is not empty
        if (req.query.name && req.query.name.trim() !== '') {
            query.name = { $regex: req.query.name, $options: "i" }; // Using regex for partial match, case-insensitive
        }

        // ✅ Task 3: Add other filters to the query
        if (req.query.category && req.query.category.trim() !== '') {
            query.category = req.query.category;
        }

        if (req.query.condition && req.query.condition.trim() !== '') {
            query.condition = req.query.condition;
        }

        if (req.query.age_years && req.query.age_years.trim() !== '') {
            query.age_years = { $lte: parseInt(req.query.age_years) };
        }

        // ✅ Task 4: Fetch filtered secondChanceItems
        const items = await collection.find(query).toArray();

        res.json(items);
    } catch (e) {
        next(e);
    }
});

module.exports = router;
