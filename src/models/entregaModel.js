const pool = require("../config/db");
const { pedidoModel } = require("../models/pedidoModel");


const entregaModel = {
  /**
   * Gerencia a Transação Completa de um Pedido.
   * Abre conexão e inicia transação.
   * Insere o pedido.
   * Insere a entrega com os valores calculados.
   * Faz Commit se tudo der certo ou Rollback se der erro.
   * * @async
   * @param {Object} dados Dados brutos recebidos da requisição.
   * @param {Object} Objeto com os valores finais já calculados pelo controller.
   * @param {number} distancia Valor monetário da distância.
   * @param {number} peso Valor monetário do peso.
   * @param {number} acrescimo Valor do acréscimo.
   * @param {number} desconto Valor do desconto.
   * @param {number} taxa Valor da taxa extra.
   * @param {number} final Valor total final a ser cobrado.
   * @returns {Promise<object>} Retorna o ID do pedido criado e o valor final.
   * @throws {Error} Lança erro caso a transação falhe, forçando o tratamento no controller.
   */
  salvarPedidoCompleto: async (dados, dadosPedido) => {
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    try {
    //   const { dados } = dadosPI;
     
   
      // Salva o Pedido
      const resPedido = await pedidoModel.inserirPedido(
        dados.ID_cliente,
        dados.data_do_pedido,
        dados.tipo_de_entrega,
        dados.distancia,
        dados.peso_de_carga,
        dados.valor_da_base_por_km,
        dados.valor_da_base_por_kg,
        connection
      );

    //   const values = [
    //     pIdCliente,
    //     pDataPedido,
    //     pTipoEntrega,
    //     pDistancia,
    //     pPesoCarga,
    //     pBaseKm,
    //     pBaseKg,
    //     pConnection,
    //   ];
      const idPedido = resPedido.insertId;

      // Salva a Entrega
      const sqlEntrega = `
                INSERT INTO Entregas (ID_pedido, valor_da_distancia, valor_do_peso, acrescimo, desconto, taxa_extra, valor_final, status_entrega)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

      const valuesEntrega = [
        idPedido,
        dados.distancia,
        dados.peso_de_carga,
        dadosPedido.acrescimo,
        dadosPedido.desconto,
        dadosPedido.taxa,
        dadosPedido.final,
        "calculado",
      ];

      const resEntrega=await connection.query(sqlEntrega, valuesEntrega);

      // Confirma as alterações no banco
      await connection.commit();

      return { resPedido, resEntrega};
    } catch (error) {
      // Em caso de erro, desfaz tudo
      if (connection) {
        await connection.rollback();
        console.warn("Transação desfeita (ROLLBACK executado).");
      }
      throw error;
    } finally {
      // Libera a conexão para o pool
      if (connection) connection.release();
    }
  },
};

module.exports = { entregaModel };
