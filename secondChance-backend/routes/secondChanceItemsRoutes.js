const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const connectToDatabase = require('../models/db');
const logger = require('../logger');

// Define the upload directory path
const directoryPath = 'public/images';

// Set up storage for uploaded files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, directoryPath); // Specify the upload directory
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Use the original file name
    },
});

const upload = multer({ storage: storage });

// Get all secondChanceItems
router.get('/', async (req, res, next) => {
    logger.info('/ called');
    try {
        // Step 2: task 1 - Retrieve the database connection
        const db = await connectToDatabase();

        // Step 2: task 2 - Retrieve the secondChanceItems collection
        const collection = db.collection('secondChanceItems');

        // Step 2: task 3 - Fetch all secondChanceItems
        const secondChanceItems = await collection.find({}).toArray();

        // Step 2: task 4 - Return the secondChanceItems as JSON
        res.json(secondChanceItems);
    } catch (e) {
        logger.console.error('Oops something went wrong', e);
        next(e);
    }
});

// Add a new item
router.post('/', upload.single('file'), async (req, res, next) => {
    try {
        // Step 3: Task 1 - Retrieve the database connection
        const db = await connectToDatabase();

        // Step 3: Task 2 - Retrieve the secondChanceItems collection
        const collection = db.collection('secondChanceItems');

        // Step 3: Task 3 - Create a new secondChanceItem from the request body
        let secondChanceItem = req.body;

        // Step 3: Task 4 - Get the last id, increment it by 1, and set it to the new secondChanceItem
        const lastItemQuery = await collection.find().sort({ 'id': -1 }).limit(1);
        await lastItemQuery.forEach(item => {
            secondChanceItem.id = (parseInt(item.id) + 1).toString();
        });

        // Step 3: Task 5 - Set the current date in the new item
        const date_added = Math.floor(new Date().getTime() / 1000);
        secondChanceItem.date_added = date_added;

        // Step 3: Task 6 - Add the secondChanceItem to the database
        const result = await collection.insertOne(secondChanceItem);

        // Step 3: Task 7 - Upload the image to the images directory
        // ✅ The upload.single('file') middleware already handles this.

        res.status(201).json({ message: "Item inserted successfully", insertedId: result.insertedId });
 // Return the inserted item
    } catch (e) {
        logger.console.error('Error adding new secondChanceItem', e);
        next(e);
    }
});


// Get a single secondChanceItem by ID
router.get('/:id', async (req, res, next) => {
    try {
        // Step 4: Task 1 - Retrieve the database connection
        const db = await connectToDatabase();

        // Step 4: Task 2 - Retrieve the secondChanceItems collection
        const collection = db.collection('secondChanceItems');

        // Step 4: Task 3 - Find a specific secondChanceItem by its ID
        const id = req.params.id;
        const secondChanceItem = await collection.findOne({ id: id });

        // Step 4: Task 4 - Return the secondChanceItem or an error if not found
        if (!secondChanceItem) {
            return res.status(404).send('secondChanceItem not found');
        }

        res.json(secondChanceItem);
    } catch (e) {
        logger.console.error('Error fetching secondChanceItem by ID', e);
        next(e);
    }
});


// Update an existing item
router.put('/:id', async (req, res, next) => {
    try {
        // Step 5: Task 1 - Retrieve the database connection
        const db = await connectToDatabase();

        // Step 5: Task 2 - Retrieve the secondChanceItems collection
        const collection = db.collection('secondChanceItems');

        const id = req.params.id;

        // Step 5: Task 3 - Check if the item exists
        const secondChanceItem = await collection.findOne({ id });
        if (!secondChanceItem) {
            logger.error('secondChanceItem not found');
            return res.status(404).json({ error: 'secondChanceItem not found' });
        }

        // Step 5: Task 4 - Update the item's specific attributes
        secondChanceItem.category = req.body.category;
        secondChanceItem.condition = req.body.condition;
        secondChanceItem.age_days = req.body.age_days;
        secondChanceItem.description = req.body.description;
        secondChanceItem.age_years = Number((secondChanceItem.age_days / 365).toFixed(1));
        secondChanceItem.updatedAt = new Date();

        const updatepreloveItem = await collection.findOneAndUpdate(
            { id },
            { $set: secondChanceItem },
            { returnDocument: 'after' }
        );

        // Step 5: Task 5 - Send confirmation
        if (updatepreloveItem) {
            res.json({ uploaded: 'success' });
        } else {
            res.json({ uploaded: 'failed' });
        }
    } catch (e) {
        logger.console.error('Error updating secondChanceItem', e);
        next(e);
    }
});


// Delete an existing item
router.delete('/:id', async (req, res, next) => {
    try {
        // Step 6: Task 1 - Retrieve the database connection
        const db = await connectToDatabase();

        // Step 6: Task 2 - Retrieve the secondChanceItems collection
        const collection = db.collection('secondChanceItems');

        const id = req.params.id;

        // Step 6: Task 3 - Check if the item exists
        const secondChanceItem = await collection.findOne({ id });
        if (!secondChanceItem) {
            logger.error('secondChanceItem not found');
            return res.status(404).json({ error: 'secondChanceItem not found' });
        }

        // Step 6: Task 4 - Delete the item
        await collection.deleteOne({ id });
        res.json({ deleted: 'success' });

    } catch (e) {
        logger.console.error('Error deleting secondChanceItem', e);
        next(e);
    }
});


module.exports = router;
