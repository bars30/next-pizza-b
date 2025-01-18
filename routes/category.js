const express = require('express');
const { client } = require('../db');
 
const router = express.Router();

router.get('/products', async (req, res) => {
  const query = req.query.query;
 console.log(query);
 

  try {
    // Получаем все продукты из базы данных
    const result = await client.query(`
   SELECT  
    c.id AS category_id, 
    c.name AS category_name,
    json_agg(
        json_build_object(
            'id', p.id,
            'name', p.name,
            'imageUrl', p."imageUrl", 
            'ingredients', p.ingredients,
            'price', p.price,
            'items', (
                SELECT json_agg(it)
                FROM "ProductItem" it
                WHERE it."productId" = p.id
            )
        )
    )::TEXT AS products -- Преобразуем JSON в текст
FROM "Category" c
LEFT JOIN "Product" p ON p."categoryId" = c.id
GROUP BY c.id;

     `);
     console.log(result);
     
    console.log('All categorys:', result.rows);
    console.log('All products row 1:', result.rows[0]['products']);
    const response = result.rows;
    res.json({ response});
    // console.log('All products:', result.rows[0]);
// console.log(result.rows[0]);

   
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching Products.' });
  }
});


router.post('/products/filter', async (req, res) => {
  const { pizzaType, priceFrom, priceTo, selectedIngredients, sizes } = req.body;
//   const payload = {
//     pizzaType: this.filters.pizzaType.map(Number),
//     priceFrom: this.filters.priceFrom,
//     priceTo: this.filters.priceTo,
//     sizes: this.filters.sizes.map(Number),
//   };
console.log(pizzaType);
console.log(priceFrom);
console.log(priceTo);
console.log(selectedIngredients);
console.log(sizes);
// console.log('Payload to send:', JSON.stringify(payload, null, 2));

  try {
    const result = await client.query(
      `
      SELECT 
        c.id AS category_id, 
        c.name AS category_name,
        json_agg(
          json_build_object(
            'id', p.id,
            'name', p.name,
            'imageUrl', p."imageUrl",
            'ingredients', p.ingredients,
            'price', p.price,
            'items', (
              SELECT json_agg(it)
              FROM "ProductItem" it
              WHERE it."productId" = p.id
                AND (it."pizzaType" = ANY($1) OR $1 IS NULL)
                AND (it."size" = ANY($2) OR $2 IS NULL)
                AND (it."price" >= $3 AND it."price" <= $4)
            )
          )
        ) AS products
      FROM "Category" c
      LEFT JOIN "Product" p ON p."categoryId" = c.id
      WHERE (
        $5::int[] IS NULL OR
        EXISTS (
          SELECT 1
          FROM unnest(p.ingredients) AS ingredient
          WHERE ingredient = ANY($5)
        )
      )
      GROUP BY c.id
      `,
      [
        pizzaType ? pizzaType.map(Number) : null,
        sizes ? sizes.map(Number) : null,
        priceFrom || 0,
        priceTo || 30000,
        selectedIngredients ? selectedIngredients.map(Number) : null,
      ]
    );

    res.status(200).json({ response: result.rows });
  } catch (error) {
    console.error('Error filtering products:', error);
    res.status(500).json({ error: 'Error filtering products.' });
  }
});



router.get('/categories', async (req, res) => {
  const query = req.query.query;
 console.log(query);
 
  try {
    const result = await client.query(`SELECT * FROM "Category";`);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching Products.' });
  }
});

module.exports = router;
