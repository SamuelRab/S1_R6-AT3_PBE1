const { pedidoModel } = require("../models/pedidoModel");
const { entregaModel } = require("../models/entregaModel");
const pool = require("../config/db"); 

/**
 * @typedef {Object} PedidoInput
 * @property {number} ID_cliente ID do cliente.
 * @property {string} data_do_pedido Data da realização do pedido.
 * @property {('urgente'|'normal')} tipo_de_entrega Tipo de entrega para cálculo.
 * @property {number} distancia Distância em km para o cálculo.
 * @property {number} peso_de_carga Peso da carga em kg para o cálculo.
 * @property {number} valor_da_base_por_km Custo base por quilômetro.
 * @property {number} valor_da_base_por_kg Custo base por quilograma.
 */

const pedidoController = {
    /**
     * Insere um novo pedido, executa o cálculo do frete com base em regras de negócio 
     * e insere o registro de entrega, tudo em uma única transação.
     * Rota: POST /pedidos
     * @async
     * @function incluirPedidoComCalculo
     * @param {Request} req Requisição contendo os dados do pedido no corpo.
     * @param {Response} res Resposta HTTP.
     * @returns {Promise<void>} Envia resposta JSON de sucesso ou erro 
     */
    incluirPedidoComCalculo: async (req, res) => {
        
        try {
            // Iniciar Transação: Obter conexão e iniciar a transmissão de dados
            connection = await pool.getConnection(); 
            await connection.beginTransaction(); 

            /** @type {PedidoInput} */
            const { 
                ID_cliente, 
                data_do_pedido, 
                tipo_de_entrega, 
                distancia, 
                peso_de_carga, 
                valor_da_base_por_km, 
                valor_da_base_por_kg 
            } = req.body;

            // Inserir Pedido 
            const resultadoPedido = await pedidoModel.inserirPedido(
                ID_cliente, data_do_pedido, tipo_de_entrega, distancia, peso_de_carga, 
                valor_da_base_por_km, valor_da_base_por_kg, connection // Passa a conexão entre os dados
            );

            const ID_pedido = resultadoPedido.insertId;

            // Lógica de Cálculo do Frete
            const valor_da_distancia = distancia * valor_da_base_por_km;
            const valor_do_peso = peso_de_carga * valor_da_base_por_kg;
            let valor_base = valor_da_distancia + valor_do_peso;

            let acrescimo = 0;
            let desconto = 0;
            let taxa_extra = 0;
            
            // Acréscimo pela entrega urgente
            if (tipo_de_entrega.toLowerCase() === 'urgente') {
                acrescimo = valor_base * 0.20;
            }
            let valor_final_tempo = valor_base + acrescimo;

            // Desconto por Valor Alto 
            if (valor_final_tempo > 500.00) {
                desconto = valor_final_tempo * 0.10;
            }
            let valor_final = valor_final_tempo - desconto; 

            // Taxa Extra por peso excessivo
            if (peso_de_carga > 50) {
                taxa_extra = 15.00; 
            }
            
            valor_final = valor_final + taxa_extra;
            valor_final = parseFloat(valor_final.toFixed(2));
            
            const status_entrega = 'calculado';

            // Inserir Entrega 
            const resultadoEntrega = await entregaModel.inserirEntrega(
                ID_pedido, valor_da_distancia, valor_do_peso, acrescimo, desconto, 
                taxa_extra, valor_final, status_entrega, connection // Passa a conexão
            );

            // Finalizar Transação entre dados com commit
            await connection.commit(); 
        
            // Retorno de Sucesso da operação
            res.status(201).json({
                message: "Pedido e Entrega registrados e calculados com sucesso !!!!!!",
                ID_pedido: ID_pedido,
                valor_final: valor_final,
                detalhes_calculo: {
                    valor_base: valor_base.toFixed(2),
                    acrescimo: acrescimo.toFixed(2),
                    desconto: desconto.toFixed(2),
                    taxa_extra: taxa_extra.toFixed(2),
                }
            });

        } catch (error) {
            // Tratamento de Erro e ROLLBACK
            if (connection) {
                await connection.rollback(); // Desfaz todas as operações se necessitar
                console.warn('Transação desfeita (ROLLBACK executado).');
            }
            
            console.error(error);
            // Retorna erro na transação
            res.status(500).json({
                message: "Falha na transação do Pedido/Entrega. O registro foi desfeito.",
                errorMessage: error.message,
            });
        }
    },
};

module.exports = { pedidoController };