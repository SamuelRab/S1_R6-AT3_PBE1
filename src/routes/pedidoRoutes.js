const express = require('express');
const pedidoRoutes = express.Router();

const {pedidoController} = require('../controllers/pedidoController');

pedidoRoutes.post('/pedidos', pedidoController.incluirPedidoComCalculo); 
pedidoRoutes.get('/pedidos/:id_pedido', pedidoController.BuscarPedidoPorID);
pedidoRoutes.get('/pedidos', pedidoController.buscarTodosPedidos);
pedidoRoutes.delete('/pedidos/:id_pedido', pedidoController.excluirPedido);
pedidoRoutes.put('/pedidos/:id_pedido', pedidoController.atualizarPedidoComCalculo);



module.exports = {pedidoRoutes};