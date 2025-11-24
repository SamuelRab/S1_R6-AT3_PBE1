const express = require('express');
const clienteRoutes = express.Router();

const {clienteController} = require('../controllers/clienteController');

clienteRoutes.get('/clientes', clienteController.buscarTodosclientes);
clienteRoutes.get('/clientes/:id_cliente', clienteController.buscarclientePorID);
clienteRoutes.post('/clientes', clienteController.incluircliente);
clienteRoutes.put('/clientes/:id_cliente', clienteController.atualizarCliente);
clienteRoutes.delete('/clientes/:id_cliente', clienteController.excluirCliente);

module.exports = {clienteRoutes};