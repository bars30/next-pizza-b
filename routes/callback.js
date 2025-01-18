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
           (item) =>
             `<li>${item.productItem.product.name} | ${item.productItem.price} ₽ x ${item.quantity} шт. = ${
               item.productItem.price * item.quantity
             } ₽</li>`,
         )
         .join('')}
     </ul>
   </div>
 `;
}

// Обработчик POST-запроса
router.post('/payment-callback', async (req, res) => {
  console.log('🧪🪇🧪🪇🧪🪇🧪🪇🧪🪇🧪🪇');
  try {
   const body = req.body;
   console.log('🧪🪇🧪🪇🧪🪇🧪🪇🧪🪇🧪🪇');
   console.log(body);
   

   // Извлекаем заказ по ID
   const result = await pool.query('SELECT * FROM "Order" WHERE id = $1', [
     Number(body.object.metadata.order_id),
   ]);
   const order = result.rows[0];

   if (!order) {
     return res.status(404).json({ error: 'Order not found' });
   }

   const isSucceeded = body.object.status === 'succeeded';

   // Обновляем статус заказа
   await pool.query('UPDATE "Order" SET status = $1 WHERE id = $2', [
     isSucceeded ? 'SUCCEEDED' : 'CANCELLED',
     order.id,
   ]);

   const items = JSON.parse(order.items);

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
