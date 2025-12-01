const pool = require("../config/db");

/**
 * @typedef {Object} Pedido
 * @property {number} ID_pedido O ID único do pedido.
 * @property {number} ID_cliente ID do cliente que fez o pedido.
 * @property {string} data_do_pedido Data de realização do pedido (formato 'YYYY-MM-DD').
 * @property {string} tipo_de_entrega Categoria da entrega (ex: 'urgente', 'normal').
 * @property {number} distancia Distância em quilômetros.
 * @property {number} peso_de_carga Peso da carga em quilogramas.
 * @property {number} valor_da_base_por_km Custo base por quilômetro usado no cálculo.
 * @property {number} valor_da_base_por_kg Custo base por quilograma usado no cálculo.
 */

const pedidoModel = {
    
    /**
     * Insere um novo registro de pedido na tabela 'Pedido'.
     * Esta função é configurada para operar dentro de uma **transação** se uma conexão
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
    inserirPedido: async (pIdCliente, pDataPedido, pTipoEntrega, pDistancia, pPesoCarga, pBaseKm, pBaseKg, pConnection) => {
        // Query SQL para inserção de um novo pedido
        const sql = `
            INSERT INTO Pedido (ID_cliente, data_do_pedido, tipo_de_entrega, distancia, peso_de_carga, valor_da_base_por_km, valor_da_base_por_kg) 
            VALUES (?, ?, ?, ?, ?, ?, ?);
        `;
        // Array de valores
        const values = [pIdCliente, pDataPedido, pTipoEntrega, pDistancia, pPesoCarga, pBaseKm, pBaseKg];
        
        // Verifica a presença de uma conexão para transação
        if (pConnection) {
            // Executa a query usando a conexão da transação
            const [rows] = await pConnection.query(sql, values);
            return rows;
        } else {
            // Executa a query usando o pool padrão
            const [rows] = await pool.query(sql, values);
            return rows;
        }
    },
    
    /**
     * Seleciona um pedido específico de acordo com o `ID_pedido`.
     * @async
     * @function selecionarPorId
     * @param {number} pIdPedido O ID do pedido a ser buscado.
     * @returns {Promise<Object>} Uma Promise que resolve para um array contendo o pedido ou vazio.
     */
    selecionarPorId: async (pIdPedido) => {
        // Query SQL para selecionar pelo ID
        const sql = "SELECT * FROM Pedido WHERE ID_pedido = ?;";
        const values = [pIdPedido];
        const [rows] = await pool.query(sql, values);
        return rows;
    }
};

module.exports = { pedidoModel };