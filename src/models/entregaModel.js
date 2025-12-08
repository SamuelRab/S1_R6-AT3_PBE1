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

  
      const idPedido = resPedido.insertId;

      
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

      
      await connection.commit();

      return { resPedido, resEntrega};
    } catch (error) {
      if (connection) {
        await connection.rollback();
        console.warn("Transação desfeita (ROLLBACK executado).");
      }
      throw error;
    } finally {
      if (connection) connection.release();
    }
  },

  /**
     * Atualiza o registro de entrega associado a um pedido, recalculando os valores.
     * @async
     * @function alterarEntrega
     * @param {number} pIdPedido ID do pedido.
     * @param {number} pValDistancia Novo valor distância.
     * @param {number} pValPeso Novo valor peso.
     * @param {number} pAcrescimo Novo acréscimo.
     * @param {number} pDesconto Novo desconto.
     * @param {number} pTaxaExtra Nova taxa extra.
     * @param {number} pValorFinal Novo valor final.
     * @param {string} pStatus Novo status da entrega.
     * @param {PoolConnection} pConnection Conexão de transação (obrigatória para esta operação).
     * @returns {Promise<ResultSetHeader>} Resultado da operação.
     */
  alterarEntrega: async (pIdPedido, pValDistancia, pValPeso, pAcrescimo, pDesconto, pTaxaExtra, pValorFinal, pStatus, pConnection) => {
        
    const sql = `
        UPDATE Entregas
        SET valor_da_distancia=?, valor_do_peso=?, acrescimo=?, desconto=?, taxa_extra=?, 
            valor_final=?, status_entrega=?
        WHERE ID_pedido = ?;
    `;
    const values = [pValDistancia, pValPeso, pAcrescimo, pDesconto, pTaxaExtra, pValorFinal, pStatus, pIdPedido];
    
    
    const [rows] = await pConnection.query(sql, values);
    return rows;
}
};

module.exports = { entregaModel };
