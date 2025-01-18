require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');


const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const passwordRoutes = require('./routes/password');
const popupRoutes = require('./routes/popup');
const ingredientsRoutes = require('./routes/ingredients.js');
const productsRoutes = require('./routes/products/search.js');
const categoryRoutes = require('./routes/category.js');
const productItemRoutes = require('./routes/product-items.js');
const cardRoutes =  require('./routes/card/card.js');
const checkoutRoutes = require('./routes/checkout.js');
const callbackRoutes = require('./routes/callback.js');


const app = express();
app.use(bodyParser.json());
app.use(cookieParser());

const corsOptions = {
    origin: ['http://localhost:3000', 'http://127.0.0.1:5500', 'http://localhost:4200'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
};

app.use(cors(corsOptions));


app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/password', passwordRoutes);
app.use('/popup', popupRoutes);
app.use('/api', ingredientsRoutes);
app.use('/api/product', productsRoutes);
app.use('/api/category', categoryRoutes);
app.use('/product-items', productItemRoutes);
app.use('/card', cardRoutes);
app.use('/checkout', checkoutRoutes);
app.use('/callback', callbackRoutes)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
