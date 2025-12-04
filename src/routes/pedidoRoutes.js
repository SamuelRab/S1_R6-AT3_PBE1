const express = require('express');
const pedidoRoutes = express.Router();

const {pedidoController} = require('../controllers/pedidoController');

pedidoRoutes.post('/pedidos', pedidoController.incluirPedidoComCalculo); 

module.exports = {pedidoRoutes};