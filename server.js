const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const connectDatabase = require('./helpers/database/connectDatabase');
const routers = require('./routers/index');
const customErrorHandler = require('./middlewares/errors/customErrorHandler');

dotenv.config({
    path: './config/env/config.env'
});

connectDatabase();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5001;

app.use('/api', routers);
app.use(express.static(path.join(__dirname, 'public')));
app.use(customErrorHandler);

app.listen(PORT, () => {
    console.log(`Question Answer API running on port ${PORT} [${process.env.NODE_ENV}]`);
});
