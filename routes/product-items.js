


const express = require('express');
const { client } = require('../db');
const { authenticateToken } = require('../middlewares/auth');
 
const router = express.Router();



router.post('/', async (req, res) => {
    console.log(req.body);
    const { id: productId } = req.body; // Access id directly
    try {
        const result = await client.query(`
            SELECT * FROM "ProductItem" WHERE "productId" = $1
        `, [productId]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching variatons.', details: error.message });
    }
});

module.exports = router;