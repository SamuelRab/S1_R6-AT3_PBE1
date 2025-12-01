const pool = require("../config/db");

const entregaModel = {
    
    /**
     * Insere um novo registro de entrega na tabela Entregas.
     * * @async
     * @function inserirEntrega
     * @param {number} pIdPedido ID do pedido ao qual esta entrega se refere.
     * @param {number} pValDistancia Valor monetário calculado com base na distância.
     * @param {number} pValPeso Valor monetário calculado com base no peso da carga.
     * @param {number} pAcrescimo Valor total de acréscimos aplicados ao frete.
     * @param {number} pDesconto Valor total de descontos aplicados ao frete.
     * @param {number} pTaxaExtra Valor de taxas extras.
     * @param {number} pValorFinal Valor final calculado do frete.
     * @param {string} pStatus Status atual da entrega.
     * @returns {Promise<Object>} Objeto contendo o ID inserido e linhas afetadas.
     */

    inserirEntrega: async (pIdPedido, pValDistancia, pValPeso, pAcrescimo, pDesconto, pTaxaExtra, pValorFinal, pStatus, pConnection) => {
        // Query SQL para inserção na tabela Entrega
        const sql = `
            INSERT INTO Entrega (ID_pedido, valor_da_distancia, valor_do_peso, acrescimo, desconto, taxa_extra, valor_final, status_entrega)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        `;
        // Array de valores
        const values = [pIdPedido, pValDistancia, pValPeso, pAcrescimo, pDesconto, pTaxaExtra, pValorFinal, pStatus];
        
        // Verifica se uma conexão de transação foi fornecida
        if (pConnection) {
            // Executa a query usando a conexão da transação 
            const [rows] = await pConnection.query(sql, values);
            return rows;
        } else {
            // Executa a query usando o pool padrão 
            const [rows] = await pool.query(sql, values);
            return rows;
        }
    }
};

module.exports = { entregaModel };