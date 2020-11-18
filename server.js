const express = require('express');
const dotenv = require('dotenv');

const app = express();

dotenv.config({path: './config/config.env'});

// app.use(express.urlencoded({extended: false}));
// app.use(express.json({extended: false}));

const PORT = process.env.PORT || 4000;
app.listen(PORT, console.log(`server started in ${process.env.NODE_ENV} mode on port ${PORT}`));