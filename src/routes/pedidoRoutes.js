const express = require('express');
const pedidoRoutes = express.Router();

const {pedidoController} = require('../controllers/pedidoController');

pedidoRoutes.post('/pedidos', pedidoController.incluirPedidoComCalculo); 
pedidoRoutes.get('/pedidos/:id_pedido', pedidoController.BuscarPedidoPorID);
pedidoRoutes.get('/pedidos', pedidoController.buscarTodosPedidos);


module.exports = {pedidoRoutes};