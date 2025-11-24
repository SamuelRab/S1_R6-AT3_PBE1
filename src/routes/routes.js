const express = require('express');
const router = express.Router();

const {clienteRoutes} = require('./clienteRoutes');
const {pedidoRoutes} = require('./pedidoRoutes'); 

router.use('/', clienteRoutes);
router.use('/', pedidoRoutes); 

module.exports = {router};