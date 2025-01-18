const express = require('express');
const { client } = require('../../db');
 
const router = express.Router();

router.get('/search', async (req, res) => {
  const query = req.query.query;
 console.log(query);
 

  try {
    // Получаем все продукты из базы данных
    const result = await client.query(`SELECT * FROM "Product";`);
    console.log('All products:', result.rows);

    // Фильтруем данные по запросу (поиск по имени)
    const filteredResults = result.rows.filter(product =>
      product.name.toLowerCase().includes(query.toLowerCase())
    );

    console.log('Filtered products:', filteredResults);

    // Отправляем отфильтрованные результаты в ответ
    res.status(200).json(filteredResults);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching Products.' });
  }
});


router.post('/search/product', async (req, res) => {
  console.log(req.body.id);
  
  const query = req.query.query;
 console.log(query);
 
  productId = req.body.id;
  try {
    const result = await client.query(`SELECT * FROM "Product" WHERE id = $1;`, [productId]);
    console.log('All products:', result.rows);

  
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching Products.' });
  }
});

module.exports = router;
