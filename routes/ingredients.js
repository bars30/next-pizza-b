const express = require('express');
const { client } = require('../db');
const { authenticateToken } = require('../middlewares/auth');
 
const router = express.Router();

router.get('/ingredients', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM "Ingredient";');
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching Ingredients.' });
    }
});

router.post('/product/ingredient', async (req, res) => {
    console.log(req.body);
    const { id: productId } = req.body; // Access id directly
    try {
        const result = await client.query(`
            SELECT i.*
            FROM "Product" p
            JOIN "Ingredient" i ON i.id = ANY(p.ingredients)
            WHERE p.id = $1;
        `, [productId]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching Ingredients.', details: error.message });
    }
});

module.exports = router;