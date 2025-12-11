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

      
      if (
        !data_do_pedido ||
        data_do_pedido.trim().length < 10 ||
        !tipo_de_entrega ||
        tipo_de_entrega.trim().length < 3 ||
        !distancia ||
        distancia <= 0 ||
        !peso_de_carga ||
        peso_de_carga <= 0 ||
        !valor_da_base_por_km ||
        valor_da_base_por_km <= 0 ||
        !valor_da_base_por_kg ||
        valor_da_base_por_kg <= 0
      ) {
        return res.status(400).json({
          message: "Dados inválidos ou faltando campos obrigatórios.",
        });
      }

     
      const calculo = await functions.calculoEntrega(dados);

      const resultado = await entregaModel.salvarPedidoCompleto(dados, calculo);

      
      res.status(201).json({
        message: "Pedido e Entrega registrados com sucesso!",
        dados: resultado,
      });
    } catch (error) {
      console.error("Erro no controller:", error);
      res.status(500).json({
        message: "Erro ao processar o pedido.",
        error: error.message,
      });
    }
  },

  
    /**
     * Retorna um cliente específico pelo seu ID.
     * Rota: GET /clientes/:id_pedido
     * @async
     * @function buscarPedidoPorID
     * @param {Request} req Requisição contendo nos parâmetros.
     * @param {Response} res Resposta HTTP.
     * @returns {Promise<Array<<Object>} Envia uma resposta JSON com o cliente ou erro
     */

  BuscarPedidoPorID: async (req, res) => {
    try {
     
      const id = Number(req.params.id_pedido);

      if (!id || !Number.isInteger(id)) {
        return res.status(400).json({
          message: "ID inválido. Forneça um número inteiro.",
        });
      }

      
      const resultado = await pedidoModel.selecionarPorId(id);

     
      if (!resultado || (Array.isArray(resultado) && resultado.length === 0)) {
        return res.status(404).json({
          message: `Pedido com ID ${id} não localizado.`,
        });
      }

      
      const pedidoRetorno = Array.isArray(resultado) ? resultado[0] : resultado;

     
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

  /**
     * Retorna todos os pedidos cadastrados.
     * Rota: GET /pedidos
     * @async
     * @function buscarTodosPedidos
     * @param {Request} req Objeto da requisição HTTP.
     * @param {Response} res Objeto da resposta HTTP.
     * @returns {Promise<Array<<Object>} Envia uma resposta JSON com os dados dos clientes ou uma mensagem de erro/tabela vazia.
     */

  buscarTodosPedidos: async (req, res) => {
    try {
      const resultado = await pedidoModel.selecionarTodos();

     
      if (resultado.length === 0) {
        return res
          .status(200)
          .json({ message: "A tabela selecionada não contem dados" });
      }

      res.status(200).json({ message: "Dados recebidos", data: resultado });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Ocorreu um erro no servidor.",
        errorMessage: error.message,
      });
    }
  },

  /**
     * Exclui um pedido
     * Rota: DELETE /pedidos/:id_pedido
     * @async
     * @function excluirPedido
     * @param {Request} req Requisição contendo nos parâmetros.
     * @param {Response} res Resposta HTTP.
     * @returns {Promise<void>} Envia resposta JSON de sucesso ou erro.
     */

  excluirPedido: async (req, res) => {
    try {
      const id = Number(req.params.id_pedido);

      
      if (!id || !Number.isInteger(id)) {
        return res.status(400).json({ message: "Forneça um ID válido" });
      }

      
      const PedidoSelecionado = await pedidoModel.selecionarPorId(id);
      if (PedidoSelecionado.length === 0) {
        return res
          .status(404)
          .json({ message: `Registro com ID ${id} não localizado.` });
      }

      
      const resultado = await pedidoModel.excluirPedido(id);

      
      if (resultado.affectedRows === 1) {
        res
          .status(200)
          .json({ message: "Cliente excluído com sucesso", data: resultado });
      } else {
        throw new Error("Não foi possível excluir o Cliente");
      }
    } catch (error) {
      console.error(error);
      if (error.errno == 1451) {
        return res.status(400).json({
          message:
            "Não foi possível excluir o registro selecionado, existem outros registros vinculados a ele.",
        });
      }
      res.status(500).json({
        message: "Ocorreu um erro no servidor",
        errorMessage: error.message,
      });
    }
  },

  /**
   * Atualiza um Pedido e a Entrega associada em uma transação.
   * Rota: PUT /pedidos/:id_pedido
   * @async
   * @function atualizarPedidoComCalculo
   * @param {Request} req Requisição contendo o ID do pedido no parâmetro e dados de atualização no corpo.
   * @param {Response} res Resposta HTTP.
   * @returns {Promise<void>} Envia resposta JSON de sucesso (200) ou erro (400/404/500).
   */
  atualizarPedidoComCalculo: async (req, res) => {
    const ID_pedido = Number(req.params.id_pedido);
    const novosDados = req.body;

    try {
    
      if (!ID_pedido || !Number.isInteger(ID_pedido)) {
        return res.status(400).json({ message: "ID do Pedido inválido." });
      }

      
      const pedidoAtual = await pedidoModel.selecionarPorId(ID_pedido);
      if (pedidoAtual.length === 0) {
        return res
          .status(404)
          .json({ message: `Pedido com ID ${ID_pedido} não encontrado.` });
      }
      const dadosAtuais = pedidoAtual[0]; 

      
      const dadosMesclados = {
        ...dadosAtuais,
        ...novosDados,
        ID_pedido: ID_pedido, 
      };

      const {
        tipo_de_entrega,
        distancia,
        peso_de_carga,
        valor_da_base_por_km,
        valor_da_base_por_kg,
      } = dadosMesclados;

      const valor_da_distancia = distancia * valor_da_base_por_km;
      const valor_do_peso = peso_de_carga * valor_da_base_por_kg;
      let valor_base = valor_da_distancia + valor_do_peso;

      let acrescimo = 0;
      let desconto = 0;
      let taxa_extra = 0;

      if (tipo_de_entrega.toLowerCase() === "urgente") {
        acrescimo = valor_base * 0.2;
      }
      let valor_final_tempo = valor_base + acrescimo;

      if (valor_final_tempo > 500.0) {
        desconto = valor_final_tempo * 0.1;
      }
      let valor_final = valor_final_tempo - desconto;

      if (peso_de_carga > 50) {
        taxa_extra = 15.0;
      }

      valor_final = parseFloat((valor_final + taxa_extra).toFixed(2));
      const status_entrega = "recalculado"; 

      const dadosEntrega = {
        ID_pedido,
        valor_da_distancia,
        valor_do_peso,
        acrescimo,
        desconto,
        taxa_extra,
        valor_final,
        status_entrega,
       
      };
 
      await pedidoModel.alterarPedido(dadosMesclados, dadosEntrega);
      
      res.status(200).json({
        
        message: `Pedido ${ID_pedido} e Entrega atualizados e recalculados com sucesso.`,
        valor_final: valor_final,
        detalhes_calculo: {
          valor_base: valor_base.toFixed(2),
          acrescimo: acrescimo.toFixed(2),
          desconto: desconto.toFixed(2),
          taxa_extra: taxa_extra.toFixed(2),
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message:
          "Falha na transação de atualização do Pedido/Entrega. O registro foi desfeito.",
        errorMessage: error.message,
      });
    }
  },
};

module.exports = { pedidoController };
