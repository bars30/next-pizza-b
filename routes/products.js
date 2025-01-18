const express = require('express');
const { client } = require('../db');
 
const router = express.Router();

router.get('/pr', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM "Ingredient";');
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching Ingredients.' });
    }
});

module.exports = router;