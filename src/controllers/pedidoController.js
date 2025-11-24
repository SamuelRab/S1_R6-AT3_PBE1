
const { pedidoModel } = require("../models/pedidoModel");
const { entregaModel } = require("../models/entregaModel");
const { clienteModel } = require("../models/clienteModel"); 
const pool = require("../config/db"); 

const pedidoController = {
    
    incluirPedidoComCalculo: async (req, res) => {
       
        let connection = null; 
        
        try {
            connection = await pool.getConnection();
            await connection.beginTransaction(); 

            const { 
                ID_cliente, 
                data_do_pedido, 
                tipo_de_entrega, 
                distancia, 
                peso_de_carga, 
                valor_da_base_por_km, 
                valor_da_base_por_kg 
            } = req.body;

            const resultadoPedido = await pedidoModel.inserirPedido(
                ID_cliente, 
                data_do_pedido, 
                tipo_de_entrega, 
                distancia, 
                peso_de_carga, 
                valor_da_base_por_km, 
                valor_da_base_por_kg,
                connection 
            );

            const ID_pedido = resultadoPedido.insertId;

            const valor_da_distancia = distancia * valor_da_base_por_km;
            const valor_do_peso = peso_de_carga * valor_da_base_por_kg;
            let valor_base = valor_da_distancia + valor_do_peso;

            let acrescimo = 0;
            let desconto = 0;
            let taxa_extra = 0;
            
            if (tipo_de_entrega.toLowerCase() === 'urgente') {
                acrescimo = valor_base * 0.20;
            }
            
            let valor_final_tempo = valor_base + acrescimo;

            if (valor_final_tempo > 500.00) {
                desconto = valor_final_tempo * 0.10;
            }
            
            let valor_final = valor_final_tempo - desconto; 

            if (peso_de_carga > 50) {
                taxa_extra = 15.00;
            }
            
            valor_final = valor_final + taxa_extra;
            
            valor_final = parseFloat(valor_final.toFixed(2));
            
            const status_entrega = 'calculado';

            const resultadoEntrega = await entregaModel.inserirEntrega(
                ID_pedido, 
                valor_da_distancia, 
                valor_do_peso, 
                acrescimo, 
                desconto, 
                taxa_extra, 
                valor_final, 
                status_entrega,
                connection 
            );

            await connection.commit(); 
        
            res.status(201).json({
                message: "Pedido e Entrega registrados e calculados com sucesso (Transação OK)!",
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
            if (connection) {
                await connection.rollback(); 
                console.warn('Transação desfeita (ROLLBACK executado).');
            }
            
            console.error(error);
            res.status(500).json({
                message: "Falha na transação do Pedido/Entrega. O registro foi desfeito.",
                errorMessage: error.message,
            });
        }
    },
};

module.exports = { pedidoController };