const express = require('express');
const { client } = require('../db');
const nodemailer = require('nodemailer');
const axios = require('axios');
const router = express.Router();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Функция для отправки письма
async function sendEmail(to, subject, html) {
 await transporter.sendMail({
   from: '"Next Pizza" <your-email@gmail.com>',
   to,
   subject,
   html,
 });
}

// Шаблон письма
function OrderSuccessTemplate({ orderId, items }) {
  return `
    <div>
      <h1>Спасибо за покупку! 🎉</h1>
      <p>Ваш заказ #${orderId} оплачен. Список товаров:</p>
      <hr />
      <ul>
        ${items
          .map(
            (item) => {
              // Проверяем, существуют ли нужные свойства
              if (item.productItem && item.productItem.product) {
                return `<li>${item.productItem.product.name} | ${item.productItem.price} ₽ x ${item.quantity} шт. = ${
                  item.productItem.price * item.quantity
                } ₽</li>`;
              } else {
                return `<li>Неизвестный товар</li>`; // Если данных нет
              }
            }
          )
          .join('')}
      </ul>
    </div>
  `;
}

// Обработчик POST-запроса
router.post('/payment-callback', async (req, res) => {
  console.log('🧪🪇🧪🪇🧪🪇🧪🪇🧪🪇🧪🪇');
    // console.log("REQ",req)
  try {
   const body = req.body;
   console.log('🧪🪇🧪🪇🧪🪇🧪🪇🧪🪇🧪🪇');
   console.log(body);
         console.log("🍉🍉🍉" , body.object);
   console.log("🍉🍉🍉" , body.object.id);
   console.log("body.object.metadata.token🦄🦄🧪", body.object.metadata.token); 

   // Извлекаем заказ по ID
   const result = await client.query('SELECT * FROM "Order" WHERE token = $1', [
     body.object.metadata.token,
   ]);
   const order = result.rows[0];
   console.log("🥶order", order);
       console.log("🥶order  order.items", order.items);
       console.log("🥶order order.items[0].product", order.items[0].product);
   

   if (!order) {
    console.log("Order not found");
    
     return res.status(404).json({ error: 'Order not found' });

   } else {
       console.log("NERVERS ELAV BAYC ORDER KA")
   }

   const isSucceeded = body.object.status === 'succeeded';
   console.log("🍉🍉", isSucceeded);

 console.log('Updating order status...');
    await client.query('UPDATE "Order" SET status = $1 WHERE id = $2', [
      isSucceeded ? 'succeeded' : 'cancelled',
      order.id,
    ]);
    console.log(`Order ID ${order.id} status updated to ${isSucceeded ? 'succeeded' : 'cancelled'}`);
      

   console.log('Updating order status...');
   await client.query('UPDATE "Order" SET status = $1 WHERE id = $2', [
     isSucceeded ? 'succeeded' : 'cancelled',
     order.id,
   ]);
   console.log(`Order ID ${order.id} status updated to ${isSucceeded ? 'succeeded' : 'cancelled'}`);
   

   const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;

   if (isSucceeded) {
     // Отправляем письмо
     await sendEmail(
       order.email,
       'Next Pizza / Ваш заказ успешно оформлен 🎉',
       OrderSuccessTemplate({ orderId: order.id, items }),
     );
   } else {
     // Письмо о неуспешной оплате (можно добавить аналогично)
   }

   res.status(200).json({ message: 'Callback processed successfully' });
 } catch (error) {
   console.error('[Checkout Callback] Error:', error);
   res.status(500).json({ error: 'Server error' });
 }
});

module.exports = router;
