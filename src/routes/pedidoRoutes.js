const express = require('express');
const pedidoRoutes = express.Router();

const {pedidoController} = require('../controllers/pedidoController');

pedidoRoutes.post('/pedidos', pedidoController.incluirPedidoComCalculo); 
pedidoRoutes.put('/pedidos/:id/status', pedidoController.atualizarStatus);

module.exports = {pedidoRoutes};