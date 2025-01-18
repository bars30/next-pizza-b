const express = require('express');
const { client } = require('../../db');
 const crypto = require('crypto');
const router = express.Router();



router.get('/', async (req, res) => {
 try {
     const token = req.cookies.cartToken;
     console.log('Cart Token:', token);

     if (!token) {
         return res.status(400).json({ message: 'No cart token provided' });
     }

     const cartQuery = `
         SELECT * FROM "Cart"
         WHERE "token" = $1
         LIMIT 1;
     `;
     const cartResult = await client.query(cartQuery, [token]);

     if (cartResult.rows.length === 0) {
         return res.status(404).json({ message: 'Cart not found' });
     }

     const cart = cartResult.rows[0];
     const cartId = cart.id;
 
     // Получаем элементы корзины с продуктами и ингредиентами, включая цену ингредиента
     const itemsQuery = `
         SELECT 
             ci.id AS "cartItemId",
             ci."cartId",
             ci."quantity",
             ci."createdAt",
             ci."updatedAt",
             pi.id AS "productItemId",
             pi.price,
             pi.size,
             pi."pizzaType",
             p.id AS "productId",
             p.name AS "productName",
             p."imageUrl" AS "productImageUrl",
             i.id AS "ingredientId",
             i.name AS "ingredientName",
             i."imageUrl" AS "ingredientImageUrl",
             i.price AS "ingredientPrice" -- Добавлено поле цены ингредиента
         FROM "CartItem" ci
         JOIN "ProductItem" pi ON ci."productItemId" = pi.id
         JOIN "Product" p ON pi."productId" = p.id
         LEFT JOIN "Ingredient" i ON i.id = ANY(ci."ingredients")
         WHERE ci."cartId" = $1
         ORDER BY ci."createdAt" DESC;
     `;
     const itemsResult = await client.query(itemsQuery, [cartId]);

     // Формируем структуру данных
     const itemsMap = {};
     itemsResult.rows.forEach(row => {
         const {
             cartItemId,
             productItemId,
             productId,
             productName,
             productImageUrl,
             price,
             size,
             pizzaType,
             ingredientId,
             ingredientName,
             ingredientImageUrl,
             ingredientPrice, // Цена ингредиента
             ...cartItemData
         } = row;

         if (!itemsMap[cartItemId]) {
             itemsMap[cartItemId] = {
                 id: cartItemId,
                 cartId: cartItemData.cartId,
                 quantity: cartItemData.quantity,
                 createdAt: cartItemData.createdAt,
                 updatedAt: cartItemData.updatedAt,
                 productItem: {
                     id: productItemId,
                     price,
                     size,
                     pizzaType,
                     product: {
                         id: productId,
                         name: productName,
                         imageUrl: productImageUrl,
                     },
                 },
                 ingredients: [],
             };
         }

         if (ingredientId) {
             itemsMap[cartItemId].ingredients.push({
                 id: ingredientId,
                 name: ingredientName,
                 imageUrl: ingredientImageUrl,
                 price: ingredientPrice, // Добавлено поле цены ингредиента
             });
         }
     });

     const items = Object.values(itemsMap);
     console.log('SQL Result Rows:', itemsResult.rows); // Посмотреть все строки из SQL-запроса
     console.log('Items Map:', itemsMap); // Проверить структуру itemsMap перед преобразованием в массив
     
     return res.status(200).json({
         ...cart,
         items,
     });
 } catch (error) {
     console.error('[CART_GET] Server error', error);
     return res.status(500).json({ message: 'Не удалось получить корзину' });
 } 
});

router.post('/change-quantity', async (req, res) => {
    try {
        const { id, quantity } = req.body;
        console.log(req.body);
        
        const token = req.cookies.cartToken;
        console.log('Cart Token:', token);
   
        if (!token) {
            // return res.status(400).json({ message: 'No cart token provided' });
    }

    if (!id || !quantity) {
        return res.status(400).json({ message: 'Invalid input: id and quantity are required' });
    }

    const query = `
        UPDATE "CartItem"
        SET "quantity" = $1, "updatedAt" = NOW()
        WHERE "id" = $2
        RETURNING *;
    `;

    const values = [quantity, id];
    
    const result = await client.query(query, values); // Assuming `db.query` is your database query method
    
    
    if (result.rowCount === 0) {
        return res.status(404).json({ message: 'CartItem not found' });
    }

    console.log('Updated CartItem:', result.rows[0]);
    return res.status(200).json({ message: 'Quantity updated successfully', cartItem: result.rows[0] });
    }catch (error) {
        console.error('[CART_GET] Server error', error);
        return res.status(500).json({ message: 'Не удалось получить корзину' });
    }
})

router.post('/delete-cart-item', async (req, res) => {
    try {
        const { id } = req.body;
        console.log(req.body);
        
        const token = req.cookies.cartToken;
        console.log('Cart Token:', token);
   
        if (!token) {
            // return res.status(400).json({ message: 'No cart token provided' });
    }

    if (!id) {
        return res.status(400).json({ message: 'Invalid input: id and quantity are required' });
    }

    const query = `
        DELETE FROM "CartItem"
        WHERE id = $1;  
    `;

    const values = [id];
    
    const result = await client.query(query, values); // Assuming `db.query` is your database query method
    

    console.log('Deleted CartItem:', result.rows[0]);
    return res.status(200).json({ message: 'Item deleted successfully', cartItem: result.rows[0] });
    }catch (error) {
        console.error('[CART_GET] Server error', error);
        return res.status(500).json({ message: 'Не удалось delete ' });
    }
})



// Adding the item to card
// router.post('/add-to-cart', async (req, res) => {
//     try {
//         const {selectedSize, selectedType, ingredients, quantity} = req.body;
//         console.log('🍒selectedSize -->',selectedSize);
//         console.log('🍒selectedType -->',selectedType);
//         console.log('🍒ingredients -->',ingredients);
//         console.log('🍒quantity -->',quantity);
        
//         let token = req.cookies.cartToken;
//         console.log('Cart Token:', token);

//         if (!token) { 
//             console.log('No cart token provided');
//             token = crypto.randomUUID();  // Generate a new token if not provided
//         }
//         console.log('Generated Token:', token);

//         // Check if the token exists in the Cart table
//         const selectQuery = `
//             SELECT * FROM "Cart" WHERE "token" = $1;
//         `;
//         const values = [token];
//         const result = await client.query(selectQuery, values);

//         console.log('Query Result:', result.rows);

//         if (result.rowCount === 0) {
//             // If no rows are found, insert a new row into the Cart table
//             const insertQuery = `
//                 INSERT INTO "Cart" ("token", "createdAt", "updatedAt")
//                 VALUES ($1, NOW(), NOW())
//                 RETURNING *;
//             `;
//             const insertResult = await client.query(insertQuery, values);

//             console.log('New Cart Created:', insertResult.rows[0]);
//             return res.status(201).json(insertResult.rows[0]);
//         }

//         // If a cart with the token exists, return it
//         res.status(200).json(result.rows[0].id);
//         const cartId = result.rows[0].id;

//     } catch (error) {
//         console.error('[CART_POST] Server error', error);
//         return res.status(500).json({ message: 'Не удалось добавить элемент в корзину' });
//     }
// });

// router.post('/add-to-cart', async (req, res) => {
//     try {
//         const {productItemId, ingredients, quantity} = req.body;
//         console.log('🍒productItemId -->', productItemId);
//         console.log('🍒ingredients -->', ingredients);
//         console.log('🍒quantity -->', quantity);
        
//         let token = req.cookies.cartToken;
//         console.log('Cart Token:', token);

//         if (!token) { 
//             console.log('No cart token provided');
//             token = crypto.randomUUID();  // Генерируем новый токен, если не предоставлен

//             // Устанавливаем новый токен в куки
//     res.cookie('cartToken', token, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 }); // куки действуют 30 дней
//     console.log('Generated and set new token in cookies:', token);
//         }
//         console.log('Generated Token:', token);

//         // Проверяем, существует ли токен в таблице Cart
//         const selectQuery = `
//             SELECT * FROM "Cart" WHERE "token" = $1;
//         `;
//         const values = [token];
//         const result = await client.query(selectQuery, values);

//         console.log('Query Result:', result.rows);

//         if (result.rowCount === 0) {
//             // Если корзины с таким токеном нет, создаем новую
//             const insertQuery = `
//                 INSERT INTO "Cart" ("token", "createdAt", "updatedAt")
//                 VALUES ($1, NOW(), NOW())
//                 RETURNING *;
//             `;
//             const insertResult = await client.query(insertQuery, values);

//             console.log('New Cart Created:', insertResult.rows[0]);
//             return res.status(201).json(insertResult.rows[0]);
//         }

//         // Если корзина с таким токеном существует, получаем cartId
//         const cartId = result.rows[0].id;
//         let checkItemQuery = ``;
//         let checkItemValues = [];
//         // Проверяем, есть ли уже элемент в CartItem с таким cartId, productItemId и ingredients
//         if (ingredients == []) {
//             checkItemQuery = `
//             SELECT * FROM "CartItem" 
//             WHERE "cartId" = $1 
//             AND "productItemId" = $2 
//             `;
//             checkItemValues = [cartId, productItemId];
//         } else {
//             checkItemQuery = `
//                 SELECT * FROM "CartItem" 
//                 WHERE "cartId" = $1 
//                 AND "productItemId" = $2 
//                 AND "ingredients" = $3;
//             `;
//             checkItemValues = [cartId, productItemId, ingredients];
//         }
//         // const checkItemValues = [cartId, productItemId, ingredients];
//         const itemResult = await client.query(checkItemQuery, checkItemValues);
//         console.log(itemResult.rowCount, '🛸🛸🛸🛸🛸🛸🛸🛸🛸🛸🛸🛸🛸🛸🛸🛸🛸🛸🛸🛸🛸🛸🛸🛸🛸')
//         console.log(checkItemValues, '🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🍒🍒🍒🍒')
//         if (itemResult.rowCount > 0) {
//             // Если такой элемент существует, обновляем quantity
//             const itemId = itemResult.rows[0].id;
//             const oldQuantity = itemResult.rows[0].quantity;
//             console.log('oldQUANTITY', oldQuantity);
            
//             const newQuantity = quantity !== 1 ? quantity : oldQuantity + 1; // Увеличиваем количество

//             const updateQuery = `
//                 UPDATE "CartItem" 
//                 SET "quantity" = $1, "updatedAt" = NOW() 
//                 WHERE "id" = $2
//                 RETURNING *;
//             `;
//             const updateValues = [newQuantity, itemId];
//             const updateResult = await client.query(updateQuery, updateValues);

//             console.log('Updated CartItem:', updateResult.rows[0]);
//             return res.status(200).json(updateResult.rows[0]);
//         } else {
//             // Если такого элемента нет, добавляем новый
//             const insertItemQuery = `
//                 INSERT INTO "CartItem" ("cartId", "productItemId", "ingredients", "quantity", "createdAt", "updatedAt")
//                 VALUES ($1, $2, $3, $4, NOW(), NOW())
//                 RETURNING *;
//             `;
//             const insertItemValues = [cartId, productItemId, ingredients, quantity];
//             const insertItemResult = await client.query(insertItemQuery, insertItemValues);

//             console.log('New CartItem Created:', insertItemResult.rows[0]);
//             return res.status(201).json(insertItemResult.rows[0]);
//         }

//     } catch (error) {
//         console.error('[CART_POST] Server error', error);
//         return res.status(500).json({ message: 'Не удалось добавить элемент в корзину' });
//     }
// });

// const crypto = require('crypto');

router.post('/add-to-cart', async (req, res) => {
    try {
        const { productItemId, ingredients, quantity } = req.body;
        console.log('🍒 productItemId -->', productItemId);
        console.log('🍒 ingredients -->', ingredients);
        console.log('🍒 quantity -->', quantity);

        // Получаем токен из куки
        let token = req.cookies.cartToken;
        console.log('Cart Token:', token);

        // Если токена нет, генерируем новый
        if (!token) {
            console.log('No cart token provided');
            token = crypto.randomUUID(); // Генерация нового токена
            res.cookie('cartToken', token, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 }); // Устанавливаем токен в куки на 30 дней
            console.log('Generated and set new token in cookies:', token);
        }

        // Получаем userId, если пользователь авторизован, иначе null
        const userId = req.user?.id || null;

        // Проверяем, существует ли корзина с текущим токеном
        const selectQuery = `
            SELECT * FROM "Cart" WHERE "token" = $1;
        `;
        const values = [token];
        const result = await client.query(selectQuery, values);

        console.log('Query Result:', result.rows);

        let cartId;

        if (result.rowCount === 0) {
            // Если корзины с таким токеном нет, создаем новую
            const insertQuery = `
                INSERT INTO "Cart" ("token", "userId", "createdAt", "updatedAt")
                VALUES ($1, $2, NOW(), NOW())
                RETURNING *;
            `;
            const insertValues = [token, userId];
            const insertResult = await client.query(insertQuery, insertValues);

            console.log('New Cart Created:', insertResult.rows[0]);
            cartId = insertResult.rows[0].id;
        } else {
            // Если корзина существует, получаем её id
            cartId = result.rows[0].id;
        }

        // Проверяем, есть ли уже элемент в CartItem с таким cartId, productItemId и ingredients
        let checkItemQuery;
        let checkItemValues;

        if (!ingredients || ingredients.length === 0) {
            checkItemQuery = `
                SELECT * FROM "CartItem" 
                WHERE "cartId" = $1 
                AND "productItemId" = $2;
            `;
            checkItemValues = [cartId, productItemId];
        } else {
            checkItemQuery = `
                SELECT * FROM "CartItem" 
                WHERE "cartId" = $1 
                AND "productItemId" = $2 
                AND "ingredients" = $3;
            `;
            checkItemValues = [cartId, productItemId, ingredients];
        }

        const itemResult = await client.query(checkItemQuery, checkItemValues);
        console.log('Item Query Result:', itemResult.rows);

        if (itemResult.rowCount > 0) {
            // Если такой элемент существует, обновляем quantity
            const itemId = itemResult.rows[0].id;
            const oldQuantity = itemResult.rows[0].quantity;
            const newQuantity = quantity !== 1 ? quantity : oldQuantity + 1; // Увеличиваем количество

            const updateQuery = `
                UPDATE "CartItem" 
                SET "quantity" = $1, "updatedAt" = NOW() 
                WHERE "id" = $2
                RETURNING *;
            `;
            const updateValues = [newQuantity, itemId];
            const updateResult = await client.query(updateQuery, updateValues);

            console.log('Updated CartItem:', updateResult.rows[0]);
            return res.status(200).json(updateResult.rows[0]);
        } else {
            // Если такого элемента нет, добавляем новый
            const insertItemQuery = `
                INSERT INTO "CartItem" ("cartId", "productItemId", "ingredients", "quantity", "createdAt", "updatedAt")
                VALUES ($1, $2, $3, $4, NOW(), NOW())
                RETURNING *;
            `;
            const insertItemValues = [cartId, productItemId, ingredients, quantity];
            const insertItemResult = await client.query(insertItemQuery, insertItemValues);

            console.log('New CartItem Created:', insertItemResult.rows[0]);
            return res.status(201).json(insertItemResult.rows[0]);
        }
    } catch (error) {
        console.error('[CART_POST] Server error', error);
        return res.status(500).json({ message: 'Не удалось добавить элемент в корзину' });
    }
});


module.exports = router;