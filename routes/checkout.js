const express = require('express');
const { client } = require('../db'); // Настройка клиента PostgreSQL
const nodemailer = require('nodemailer');
const axios = require('axios');

const router = express.Router();

// router.post('/create/order', async (req, res) => {
//  console.log(req.body);
 
//     const cartToken = req.cookies.cartToken; // Получаем токен из куков
//     console.log(cartToken);

//     if (!cartToken) {
//         console.log('No token provided');
//         return res.status(400).json({
//             error: 'Token is required to proceed with the order creation.',
//         });
//     }

//     try {
//         // Получаем данные корзины и связанных элементов
//         const cartQuery = `
//             SELECT c.id as "cartId", c.token, i.id as "itemId", i.quantity, p.id as "productId", p.name as "productName", p.price
//             FROM "Cart" c
//             LEFT JOIN "CartItem" i ON c.id = i."cartId"
//             LEFT JOIN "Product" p ON i."productItemId" = p.id
//             WHERE c.token = $1;
//         `;

//         const cartResult = await client.query(cartQuery, [cartToken]);

//         if (!cartResult || cartResult.rows.length === 0) {
//             return res.status(404).json({ error: 'Cart not found or empty for the provided token.' });
//         }


//         console.log('🧪🎀🧪', cartResult);
        

//         // Преобразуем данные корзины в удобный формат
//         const cart = {
//             token: cartResult.rows[0].token,
//             items: cartResult.rows.map(row => ({
//                 itemId: row.itemId,
//                 quantity: row.quantity,
//                 product: {
//                     productId: row.productId,
//                     name: row.productName,
//                     price: row.price,
//                 },
//             })),
//         };

//         console.log('Cart:', cart);

//         // Извлекаем данные из тела запроса
//         const {
//             firstName,
//             lastName,
//             email,
//             phone,
//             deliveryAddress,
//             additionalInfo,
//         } = req.body;

//         const fullName = `${firstName} ${lastName}`;

//         // Для подсчета общей суммы корзины
//         const totalAmount = cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

//         // SQL-запрос для создания заказа
//         const orderQuery = `
//             INSERT INTO "Order" (
//                 token, "fullName", email, phone, address, comment, "totalAmount", status, items, "createdAt", "updatedAt"
//             ) VALUES (
//                 $1, $2, $3, $4, $5, $6, $7, 'Pending', $8, NOW(), NOW()
//             ) RETURNING *;
//         `;

//         // Подготовка значений для запроса
//         const orderValues = [
//             cart.token,
//             fullName,
//             email,
//             phone,
//             deliveryAddress,
//             additionalInfo,
//             totalAmount,
//             JSON.stringify(cart.items), // Конвертируем элементы корзины в JSON
//         ];

//         const orderResult = await client.query(orderQuery, orderValues);

//         // Ответ с успешным созданием заказа
//         res.status(201).json({
//             message: 'Order created successfully',
//             order: orderResult.rows[0],
//             url: "https://www.apple.com/iphone-16-pro/", // Это может быть динамическим URL для редиректа или другой логикой
//         });

//         const cartId = cartResult.rows[0].id;
//         console.log('Cart ID:', cartId);

//         // Обновляем общую сумму корзины на 0
//         const updateCartQuery = `
//             UPDATE "Cart" SET "totalAmount" = 0 WHERE id = $1 RETURNING *;
//         `;
//         console.log('Executing query to update cart total amount:', updateCartQuery, [cartId]);
//         const updateCartResult = await client.query(updateCartQuery, [cartId]);

//         if (updateCartResult.rowCount === 0) {
//          console.error('Failed to update cart:', updateCartResult);
//             return res.status(500).json({ error: 'Failed to update cart total amount.' });
//         }

//         // Удаляем все элементы из корзины
//         const deleteItemsQuery = `
//             DELETE FROM "CartItem" WHERE "cartId" = $1;
//         `;
//         await client.query(deleteItemsQuery, [cartId]);

//         res.status(200).json({
//             message: 'Cart updated and items deleted successfully.',
//         });
//     } catch (error) {
//         console.error('Error creating order:', error);
//         res.status(500).json({
//             message: 'Failed to create order',
//             error: error.message,
//         });
//     }
// });

// router.post('/create/order', async (req, res) => {
//  console.log(req.body);

//  const cartToken = req.cookies.cartToken; // Получаем токен из куков
//  console.log(cartToken);

//  if (!cartToken) {
//      console.log('No token provided');
//      return res.status(400).json({
//          error: 'Token is required to proceed with the order creation.',
//      });
//  }

//  try {
//      // Получаем данные корзины и связанных элементов
//      const cartQuery = `
//          SELECT c.id as "cartId", c.token, i.id as "itemId", i.quantity, p.id as "productId", p.name as "productName", p.price
//          FROM "Cart" c
//          LEFT JOIN "CartItem" i ON c.id = i."cartId"
//          LEFT JOIN "Product" p ON i."productItemId" = p.id
//          WHERE c.token = $1;
//      `;

//      const cartResult = await client.query(cartQuery, [cartToken]);

//      if (!cartResult || cartResult.rows.length === 0) {
//          return res.status(404).json({ error: 'Cart not found or empty for the provided token.' });
//      }

//      console.log('🧪🎀🧪', cartResult);

//      // Преобразуем данные корзины в удобный формат
//      const cart = {
//          token: cartResult.rows[0].token,
//          items: cartResult.rows.map(row => ({
//              itemId: row.itemId,
//              quantity: row.quantity,
//              product: {
//                  productId: row.productId,
//                  name: row.productName,
//                  price: row.price,
//              },
//          })),
//      };

//      console.log('Cart:', cart);

//      // Извлекаем данные из тела запроса
//      const {
//          firstName,
//          lastName,
//          email,
//          phone,
//          deliveryAddress,
//          additionalInfo,
//      } = req.body;

//      const fullName = `${firstName} ${lastName}`;

//      // Для подсчета общей суммы корзины
//      const totalAmount = cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

//      // SQL-запрос для создания заказа
//      const orderQuery = `
//          INSERT INTO "Order" (
//              token, "fullName", email, phone, address, comment, "totalAmount", status, items, "createdAt", "updatedAt"
//          ) VALUES (
//              $1, $2, $3, $4, $5, $6, $7, 'Pending', $8, NOW(), NOW()
//          ) RETURNING *;
//      `;

//      // Подготовка значений для запроса
//      const orderValues = [
//          cart.token,
//          fullName,
//          email,
//          phone,
//          deliveryAddress,
//          additionalInfo,
//          totalAmount,
//          JSON.stringify(cart.items), // Конвертируем элементы корзины в JSON
//      ];

//      const orderResult = await client.query(orderQuery, orderValues);

//      // Получаем cartId из результата
//      const cartId = cartResult.rows[0].id;
//      console.log('Cart ID:', cartId);

//      // Обновляем общую сумму корзины на 0
//      const updateCartQuery = `
//          UPDATE "Cart" SET "totalAmount" = 0 WHERE id = $1 RETURNING *;
//      `;
//      console.log('Executing query to update cart total amount:', updateCartQuery, [cartId]);
//      const updateCartResult = await client.query(updateCartQuery, [cartId]);

//      if (updateCartResult.rowCount === 0) {
//          console.error('Failed to update cart:', updateCartResult);
//          return res.status(500).json({ error: 'Failed to update cart total amount.' });
//      }

//      // Удаляем все элементы из корзины
//      const deleteItemsQuery = `
//          DELETE FROM "CartItem" WHERE "cartId" = $1;
//      `;
//      await client.query(deleteItemsQuery, [cartId]);

//      // Отправляем ответ только после успешных операций
//      res.status(201).json({
//          message: 'Order created successfully',
//          order: orderResult.rows[0],
//          url: "https://www.apple.com/iphone-16-pro/", // Это может быть динамическим URL для редиректа или другой логикой
//      });

//  } catch (error) {
//      console.error('Error creating order:', error);
//      res.status(500).json({
//          message: 'Failed to create order',
//          error: error.message,
//      });
//  }
// });
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

async function createPayement(details){
    console.log('🦄🦄setails token🦄',details.cartToken);
    console.log('🦄🦄setails🦄',details);

    console.log(details.amount);
    
    const { data } = await axios.post(
        'https://api.yookassa.ru/v3/payments/',
        {
            amount: {
                value: 11052,
                currency: "RUB"
            },
            capture: true,
            description: details.description,
            metadata: {
                order_id: details.orderId,
                token: details.cartToken
            },
            confirmation: {
                type: 'redirect',
                return_url: 'http://localhost:3000/?paid'
            },
        }, {
            auth: {
                username: '1010366',
                password: String(process.env.YOO_KASSA_API_KEY),
            },
            headers: {
                'Content-Type': 'application/json',
                'Idempotence-Key': Math.random().toString(36).substring(7),
            }
        }
    )

    return data;
}


router.post('/create/order', async (req, res) => {
 console.log(req.body);

 const cartToken = req.cookies.cartToken; // Получаем токен из куков
 console.log(cartToken);

 if (!cartToken) {
     console.log('No token provided');
     return res.status(400).json({
         error: 'Token is required to proceed with the order creation.',
     });
 }

 try {
     // Получаем данные корзины и связанных элементов
     const cartQuery = `
         SELECT c.id as "cartId", c.token, i.id as "itemId", i.quantity, p.id as "productId", p.name as "productName", p.price
         FROM "Cart" c
         LEFT JOIN "CartItem" i ON c.id = i."cartId"
         LEFT JOIN "Product" p ON i."productItemId" = p.id
         WHERE c.token = $1;
     `;

     const cartResult = await client.query(cartQuery, [cartToken]);

     if (!cartResult || cartResult.rows.length === 0) {
         return res.status(404).json({ error: 'Cart not found or empty for the provided token.' });
     }

     console.log('🧪🎀🧪', cartResult);

     // Преобразуем данные корзины в удобный формат
     const cart = {
         token: cartResult.rows[0].token,
         items: cartResult.rows.map(row => ({
             itemId: row.itemId,
             quantity: row.quantity,
             product: {
                 productId: row.productId,
                 name: row.productName,
                 price: row.price,
             },
         })),
     };

     console.log('Cart:', cart);

     // Извлекаем данные из тела запроса
     const {
         firstName,
         lastName,
         email,
         phone,
         deliveryAddress,
         additionalInfo,
     } = req.body;

     const fullName = `${firstName} ${lastName}`;

     // Для подсчета общей суммы корзины
     const totalAmount = cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

     // SQL-запрос для создания заказа
     const orderQuery = `
         INSERT INTO "Order" (
             token, "fullName", email, phone, address, comment, "totalAmount", status, items, "createdAt", "updatedAt"
         ) VALUES (
             $1, $2, $3, $4, $5, $6, $7, 'Pending', $8, NOW(), NOW()
         ) RETURNING *;
     `;

     // Подготовка значений для запроса
     const orderValues = [
         cart.token,
         fullName,
         email,
         phone,
         deliveryAddress,
         additionalInfo,
         totalAmount,
         JSON.stringify(cart.items), // Конвертируем элементы корзины в JSON
     ];
     console.log('🧪🎀🧤', totalAmount);

     
     const orderResult = await client.query(orderQuery, orderValues);

     // Получаем cartId из результата
     const cartId = cartResult.rows[0].cartId; // Используем cartId, а не просто id
     console.log('Cart ID:', cartId);
     console.log('🧪🎀🧤', cartId);

     // Обновляем общую сумму корзины на 0
     const updateCartQuery = `
         UPDATE "Cart" SET "totalAmount" = 0 WHERE id = $1 RETURNING *;
     `;
     console.log('Executing query to update cart total amount:', updateCartQuery, [cartId]);
     const updateCartResult = await client.query(updateCartQuery, [cartId]);

     if (updateCartResult.rowCount === 0) {
         console.error('Failed to update cart:', updateCartResult);
         return res.status(500).json({ error: 'Failed to update cart total amount.' });
     }

     // Удаляем все элементы из корзины
     const deleteItemsQuery = `
         DELETE FROM "CartItem" WHERE "cartId" = $1;
     `;
     await client.query(deleteItemsQuery, [cartId]);

     await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Оплатите',
      text: `
      <p>Оплатитье заказ на сумму %{totalPrice} . 
      перейдите <a href="paymentUrl">по этой ссылке</a>  </p>
      `,
  });
//   console.log(orderResult);
//   console.log(order.totalAmount);
  
  console.log('🧪🎀🧤', totalAmount);
     console.log('🧪🎀🧤', cartId);

  const paymentData = await createPayement({
    amount: totalAmount,
    orderId: cartId,
    description: 'Оплата заказа #' + cartId,
    cartToken: cartToken
  })

  if (!paymentData) {
    throw new Error('Payment data not found')
  }

  const paymentUrl = paymentData.confirmation.confirmation_url;
console.log(paymentData.confirmation.confirmation_url);


     // Отправляем ответ только после успешных операций
     res.status(201).json({
         message: 'Order created successfully',
         order: orderResult.rows[0],
         url: paymentUrl, // Это может быть динамическим URL для редиректа или другой логикой
     });

 } catch (error) {
     console.error('Error creating order:', error);
     res.status(500).json({
         message: 'Failed to create order',
         error: error.message,
     });
 }
});


router.post('/status', async (req, res) => {
    console.log(req.body);
    // console.log(req.json);
    // body = req.json;
    // console.log(body?.object.metadata.order_id);
    let gg = req.body;
    
   
    res.status(200).json({ status: 'OK', gg});
   
    
   });
   
   
module.exports = router;
