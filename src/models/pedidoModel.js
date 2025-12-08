const pool = require("../config/db");

/**
 * @typedef {Object} Pedido
 * @property {number} ID_pedido O ID único do pedido.
 * @property {number} ID_cliente ID do cliente que fez o pedido.
 * @property {string} data_do_pedido Data de realização do pedido.
 * @property {string} tipo_de_entrega Categoria da entrega.
 * @property {number} distancia Distância em quilômetros.
 * @property {number} peso_de_carga Peso da carga em quilogramas.
 * @property {number} valor_da_base_por_km Custo base por quilômetro usado no cálculo.
 * @property {number} valor_da_base_por_kg Custo base por quilograma usado no cálculo.
 */

const pedidoModel = {
  /**
   * Insere um novo registro de pedido na tabela 'Pedidos'.
   * Esta função é configurada para operar dentro de uma transação se uma conexão
   * for fornecida, garantindo que a inserção seja atômica com outras operações.
   * @async
   * @function inserirPedido
   * @param {number} pIdCliente ID do cliente associado ao pedido.
   * @param {string} pDataPedido Data da realização do pedido.
   * @param {string} pTipoEntrega Tipo de entrega.
   * @param {number} pDistancia Distância total do percurso.
   * @param {number} pPesoCarga Peso da carga.
   * @param {number} pBaseKm Valor base por km para o cálculo.
   * @param {number} pBaseKg Valor base por kg para o cálculo.
   * @param {PoolConnection | undefined} [pConnection] Objeto de conexão para uso em transações. Se nulo, usa o pool padrão.
   * @returns {Promise<ResultSetHeader>} Objeto contendo o ID inserido e linhas afetadas.
   */
  inserirPedido: async (
    pIdCliente,
    pDataPedido,
    pTipoEntrega,
    pDistancia,
    pPesoCarga,
    pBaseKm,
    pBaseKg,
    pConnection
  ) => {
   
    const sql = `
            INSERT INTO Pedidos (ID_cliente, data_do_pedido, tipo_de_entrega, distancia, peso_de_carga, valor_da_base_por_km, valor_da_base_por_kg) 
            VALUES (?, ?, ?, ?, ?, ?, ?);
        `;
 
    const values = [
      pIdCliente,
      pDataPedido,
      pTipoEntrega,
      pDistancia,
      pPesoCarga,
      pBaseKm,
      pBaseKg,
    ];

    
    const [rows] = await pConnection.query(sql, values);
    return rows;
  },

  /**
   * Seleciona um pedido específico de acordo com o `ID_pedido`.
   * @async
   * @function selecionarPorId
   * @param {number} pIdPedido 
   * @returns {Promise<Object>} 
   */
  selecionarPorId: async (pIdPedido) => {
    const sql = "SELECT * FROM Pedidos WHERE ID_pedido = ?;";
    const values = [pIdPedido];
    const [rows] = await pool.query(sql, values);
    return rows;
  },

  /**
   * Seleciona todos os clientes cadastrados na tabela
   * @async
   * @function selecionarTodos
   * @returns Retorna o resultado com um array de objetos, cada objeto representa um registro na tabela.
   *
   * @example
   * const clientes = await produtoModel.selecionarTodos();
   * console.log(clientes);
   * // Saída esperada
   * [
   *    {nome_completo, cpf, telefone, email, endereco}
   * ]
   */


  selecionarTodos: async () => {
    const sql = "SELECT * FROM pedidos";
    const [rows] = await pool.query(sql);
    return rows;
  },

  /**
   * Exclui um cliente da base de dados.
   * @async
   * @function excluirCliente
   * @param {number} pId ID do cliente a ser excluído.
   * @returns {Promise<Object>} Objeto contendo linhas afetadas.
   */

  excluirPedido: async (pId) => {
    const sql = "DELETE FROM pedidos WHERE id_pedido=?;";
    const values = [pId];
    const [rows] = await pool.query(sql, values);
    return rows;
  },

  /**
   * Atualiza os dados de um pedido existente.
   * @async
   * @param {Object} dados Objeto contendo todos os campos do pedido, incluindo ID_pedido.
   * @param {PoolConnection} pConnection Conexão de transação (obrigatória para esta operação).
   * @returns {Promise<ResultSetHeader>} Resultado da operação.
   */
  alterarPedido: async (dados, dadosEntrega) => {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const sql = `
            UPDATE Pedidos 
            SET ID_cliente=?, data_do_pedido=?, tipo_de_entrega=?, distancia=?, peso_de_carga=?, 
                valor_da_base_por_km=?, valor_da_base_por_kg=?
            WHERE ID_pedido = ?;
        `;
      const values = [
        dados.ID_cliente,
        dados.data_do_pedido,
        dados.tipo_de_entrega,
        dados.distancia,
        dados.peso_de_carga,
        dados.valor_da_base_por_km,
        dados.valor_da_base_por_kg,
        dados.ID_pedido,
      ];
      const [rows] = await connection.query(sql, values);

      const sqlEntrega = `
        UPDATE Entregas
        SET valor_da_distancia=?, valor_do_peso=?, acrescimo=?, desconto=?, taxa_extra=?, 
            valor_final=?, status_entrega=?
        WHERE ID_pedido = ?;
    `;
      const valuesEntrega = [
          dadosEntrega.valor_da_distancia,
          dadosEntrega.valor_do_peso,
          dadosEntrega.acrescimo,
          dadosEntrega.desconto,
          dadosEntrega.taxa_extra,
          dadosEntrega.valor_final,
          dadosEntrega.status_entrega,
          dadosEntrega.ID_pedido,
      ];

      const [rowsEntrega] = await connection.query(sqlEntrega, valuesEntrega);
      connection.commit();
      return { rows, rowsEntrega };
    } catch (error) {

      await connection.rollback();
      console.warn("Transação de atualização desfeita (ROLLBACK executado).");

      throw error;
    } 
  },
};

module.exports = { pedidoModel };
