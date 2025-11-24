
const pool = require("../config/db");

const pedidoModel = {
    inserirPedido: async (pIdCliente, pDataPedido, pTipoEntrega, pDistancia, pPesoCarga, pBaseKm, pBaseKg, pConnection) => {
        const sql = `
            INSERT INTO Pedido (ID_cliente, data_do_pedido, tipo_de_entrega, distancia, peso_de_carga, valor_da_base_por_km, valor_da_base_por_kg) 
            VALUES (?, ?, ?, ?, ?, ?, ?);
        `;
        const values = [pIdCliente, pDataPedido, pTipoEntrega, pDistancia, pPesoCarga, pBaseKm, pBaseKg];
        
        if (pConnection) {
            const [rows] = await pConnection.query(sql, values);
            return rows;
        } else {
            const [rows] = await pool.query(sql, values);
            return rows;
        }
    },
    
    selecionarPorId: async (pIdPedido) => {
        const sql = "SELECT * FROM Pedido WHERE ID_pedido = ?;";
        const values = [pIdPedido];
        const [rows] = await pool.query(sql, values);
        return rows;
    }
};

module.exports = { pedidoModel };