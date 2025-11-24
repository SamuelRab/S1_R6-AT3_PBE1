
const pool = require("../config/db");

const entregaModel = {
    inserirEntrega: async (pIdPedido, pValDistancia, pValPeso, pAcrescimo, pDesconto, pTaxaExtra, pValorFinal, pStatus, pConnection) => {
        const sql = `
            INSERT INTO Entrega (ID_pedido, valor_da_distancia, valor_do_peso, acrescimo, desconto, taxa_extra, valor_final, status_entrega)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        `;
        const values = [pIdPedido, pValDistancia, pValPeso, pAcrescimo, pDesconto, pTaxaExtra, pValorFinal, pStatus];
        
        if (pConnection) {
            const [rows] = await pConnection.query(sql, values);
            return rows;
        } else {
            const [rows] = await pool.query(sql, values);
            return rows;
        }
    }
};

module.exports = { entregaModel };