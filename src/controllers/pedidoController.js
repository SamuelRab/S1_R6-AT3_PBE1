const { entregaModel } = require("../models/entregaModel");

const pedidoController = {
    
    /**
     * Controller principal para criação de Pedidos.
     * Realiza todos os cálculos de regras de negócio 
     * e solicita ao Model a gravação segura no banco de dados.
     * * Rota associada: POST /pedidos
     * * @async
     * @param {import('express').Request} req  Objeto de requisição do Express.
     * @param {import('express').Response} res Objeto de resposta do Express.
     * @returns {Promise<Object>} Retorna JSON com sucesso ou erro.
     */
    incluirPedidoComCalculo: async (req, res) => {
        try {
            const dados = req.body;

            // Cálculos para as entregas
            const vDistancia = dados.distancia * dados.valor_da_base_por_km;
            const vPeso = dados.peso_de_carga * dados.valor_da_base_por_kg;
            let base = vDistancia + vPeso;
            
            let acrescimo = 0;
            let desconto = 0;
            let taxa = 0;

            // Tipo de urgência
            if (dados.tipo_de_entrega.toLowerCase() === 'urgente') {
                acrescimo = base * 0.20;
            }
            
            //  Desconto para valores altos 
            let parcial = base + acrescimo;
            if (parcial > 500.00) {
                desconto = parcial * 0.10;
            }

            //  Taxa extra por peso 
            if (dados.peso_de_carga > 50) {
                taxa = 15.00;
            }

            const final = parseFloat((parcial - desconto + taxa).toFixed(2));

            // Organiza os resultados para enviar ao Model
            const calculos = {
                distancia: vDistancia, 
                peso: vPeso,
                acrescimo, 
                desconto, 
                taxa, 
                final
            };

            // Dá a responsabilidade de salvar para o Model
            const resultado = await entregaModel.salvarPedidoCompleto(dados, calculos);

            // Resposta falando que o pedido e a entrega foram efetuados
            res.status(201).json({
                message: "Pedido e Entrega registrados com sucesso!",
                dados: {
                    id_pedido: resultado.idPedido,
                    valor_total: resultado.valorFinal,
                    detalhes: calculos
                }
            });

        } catch (error) {
            console.error('Erro no controller:', error);
            res.status(500).json({ 
                message: "Erro ao processar o pedido.",
                error: error.message 
            });
        }
    }
};
module.exports = { pedidoController };