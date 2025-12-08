// const { entregaModel } = require("../models/entregaModel");
const { pedidoModel } = require("../models/pedidoModel");
const { functions } = require("../functions/functions");
const { entregaModel } = require("../models/entregaModel");

const pedidoController = {
  /**
   * Controller principal para criação de Pedidos.
   * Realiza todos os cálculos de regras de negócio
   * e solicita ao Model a gravação segura no banco de dados.
   * * Rota associada: POST /pedidos
   * * @async
   * @param {import('express').Request} req  Objeto de requisição do Express.
   * @param {import('express').Response} res Objeto de resposta do Express.
   * @returns {Promise<Object>} Retorna JSON com sucesso ou erro.
   */
  incluirPedidoComCalculo: async (req, res) => {
    try {
      const dados = req.body;

    // Tratar dados
    if (!data_do_pedido || data_do_pedido.trim().length < 10 || !tipo_de_entrega || tipo_de_entrega.trim().length < 3 || !distancia || distancia <= 0 || !peso_de_carga || peso_de_carga <= 0 || !valor_da_base_por_km || valor_da_base_por_km <= 0 || !valor_da_base_por_kg || valor_da_base_por_kg <= 0) {
        return res.status(400).json({ message: "Dados inválidos ou faltando campos obrigatórios." });
    };

      // Dá a responsabilidade de salvar para o Model
      const calculo = await functions.calculoEntrega(dados);
    
      const resultado = await entregaModel.salvarPedidoCompleto(dados, calculo);

      // Resposta falando que o pedido e a entrega foram efetuados
      res.status(201).json({
        message: "Pedido e Entrega registrados com sucesso!",
        dados: resultado
      });
    } catch (error) {
      console.error("Erro no controller:", error);
      res.status(500).json({
        message: "Erro ao processar o pedido.",
        error: error.message,
      });
    }
  },

  BuscarPedidoPorID: async (req, res) => {
    try {
      // Validação do ID
      const id = Number(req.params.id_pedido);

      if (!id || !Number.isInteger(id)) {
        return res.status(400).json({
          message: "ID inválido. Forneça um número inteiro.",
        });
      }

      // Busca o pedido
      const resultado = await pedidoModel.selecionarPorId(id);

      // Validação se encontrou
      if (!resultado || (Array.isArray(resultado) && resultado.length === 0)) {
        return res.status(404).json({
          message: `Pedido com ID ${id} não localizado.`,
        });
      }

      // Tratamento do dado para retorno
      const pedidoRetorno = Array.isArray(resultado) ? resultado[0] : resultado;

      // Retorno de Sucesso
      res.status(200).json({
        message: "Pedido encontrado com sucesso",
        data: pedidoRetorno,
      });
    } catch (error) {
      console.error("Erro ao buscar pedido:", error);
      res.status(500).json({
        message: "Ocorreu um erro interno no servidor ao buscar o pedido.",
      });
    }
  },

  buscarTodosPedidos: async (req, res) => {
    try {
      // Chama o modelo para buscar todos os registros
      const resultado = await pedidoModel.selecionarTodos();

      // Retorna a mensagem 200 se não ouver dados na tabela
      if (resultado.length === 0) {
        return res
          .status(200)
          .json({ message: "A tabela selecionada não contem dados" });
      }

      // Retorna 200 com os dados recebidos
      res.status(200).json({ message: "Dados recebidos", data: resultado });
    } catch (error) {
      console.error(error);
      // Retorna 500 para um erro no servidor
      res.status(500).json({
        message: "Ocorreu um erro no servidor.",
        errorMessage: error.message,
      });
    }
  },
};
module.exports = { pedidoController };
