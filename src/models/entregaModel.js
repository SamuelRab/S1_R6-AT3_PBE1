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
     * @param {Object} calculos Objeto com os valores finais já calculados pelo controller.
     * @param {number} calculos.distancia Valor monetário da distância.
     * @param {number} calculos.peso Valor monetário do peso.
     * @param {number} calculos.acrescimo Valor do acréscimo.
     * @param {number} calculos.desconto Valor do desconto.
     * @param {number} calculos.taxa Valor da taxa extra.
     * @param {number} calculos.final Valor total final a ser cobrado.
     * @returns {Promise<object>} Retorna o ID do pedido criado e o valor final.
     * @throws {Error} Lança erro caso a transação falhe, forçando o tratamento no controller.
     */
    salvarPedidoCompleto: async (dados, calculos) => {
        let connection;
        try {
            // Inicia a transação
            connection = await pool.getConnection(); 
            await connection.beginTransaction();

            // Salva o Pedido 
            const resPedido = await pedidoModel.inserirPedido(
                ID_cliente, data_do_pedido, tipo_de_entrega, 
                distancia, peso_de_carga, 
                valor_da_base_por_km, valor_da_base_por_kg, 
                connection 
            );
            const idPedido = resPedido.insertId;

            // Salva a Entrega 
            const sqlEntrega = `
                INSERT INTO Entregas (ID_pedido, valor_da_distancia, valor_do_peso, acrescimo, desconto, taxa_extra, valor_final, status_entrega)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
            
            const valuesEntrega = [
                idPedido, calculos.distancia, calculos.peso, 
                calculos.acrescimo, calculos.desconto, calculos.taxa, 
                calculos.final, 'calculado'
            ];

            await connection.query(sqlEntrega, valuesEntrega);

            // Confirma as alterações no banco
            await connection.commit();
            
            return { idPedido, valorFinal: calculos.final };

        } catch (error) {
            // Em caso de erro, desfaz tudo
            if (connection) {
                await connection.rollback();
                console.warn('Transação desfeita (ROLLBACK executado).');
            }
            throw error;
        } finally {
            // Libera a conexão para o pool
            if (connection) connection.release(); 
        }
    }
};

module.exports = { entregaModel };