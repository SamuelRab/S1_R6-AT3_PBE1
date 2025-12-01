const { clienteModel } = require("../models/clienteModel");

/**
 * @typedef {Object} ClienteData
 * @property {string} nome_completo Nome completo do cliente.
 * @property {string} cpf CPF do cliente.
 * @property {string} [telefone] Telefone de contato.
 * @property {string} [email] Email de contato.
 * @property {string} endereco Endereço completo.
 */

const clienteController = {
    /**
     * Retorna todos os clientes cadastrados.
     * Rota: GET /clientes
     * @async
     * @function buscarTodosclientes
     * @param {Request} req Objeto da requisição HTTP.
     * @param {Response} res Objeto da resposta HTTP.
     * @returns {Promise<Array<<Object>} Envia uma resposta JSON com os dados dos clientes ou uma mensagem de erro/tabela vazia.
     */
    buscarTodosclientes: async (req, res) => {
        try {
            // Chama o modelo para buscar todos os registros
            const resultado = await clienteModel.selecionarTodos(); 
            
            // Retorna a mensagem 200 se não ouver dados na tabela
            if (resultado.length === 0) { 
                return res
                    .status(200)
                    .json({ message: "A tabela selecionada não contem dados" });
            }
            
            // Retorna 200 com os dados recebidos
            res.status(200).json({ message: "Dados recebidos", data: resultado }); 
        } catch (error) {
            console.error(error); 
            // Retorna 500 para um erro no servidor
            res.status(500).json({
                message: "Ocorreu um erro no servidor.",
                errorMessage: error.message,
            });
        }
    },

    /**
     * Retorna um cliente específico pelo seu ID.
     * Rota: GET /clientes/:id_cliente
     * @async
     * @function buscarclientePorID
     * @param {Request} req Requisição contendo nos parâmetros.
     * @param {Response} res Resposta HTTP.
     * @returns {Promise<Array<<Object>} Envia uma resposta JSON com o cliente ou erro
     */
    buscarclientePorID: async (req, res) => {
        try {
            // Valida o ID
            const id = Number(req.params.id_cliente); 
            if (!id || !Number.isInteger(id)) { 
                return res.status(400).json({ message: "Forneça um ID válido" }); // Informa para fornecer um ID válido
            }
            
            // Busca o cliente pelo ID
            const resultado = await clienteModel.selecionarPorId(id);
            
            // Verifica se o cliente foi encontrado pelo seu ID
            if (resultado.length === 0) {
                 return res.status(404).json({ message: `Cliente com ID ${id} não localizado.` }); // 404 Not Found
            }

            // Retorna o cliente encontrado
            res.status(200).json({ message: "Resultado dos dados listados", data: resultado });
        } catch (error) {
            console.error(error); 
            res.status(500).json({ 
                message: "Ocorreu um erro no servidor",
                errorMessage: error.message,
            });
        }
    },

    /**
     * Cria um novo cliente no banco de dados.
     * Rota: POST /clientes
     * @async
     * @function incluircliente
     * @param {Request} req Requisição contendo os dados do cliente no corpo.
     * @param {Response} res Resposta HTTP.
     * @returns {Promise<Array<<Object>} Envia resposta JSON de sucesso ou erro
     */
    incluircliente: async (req, res) => {
        try {
            const { nome_completo, cpf, telefone, email, endereco } = req.body;
            
            // Validação de dados de entrada
            if (!nome_completo || nome_completo.trim().length < 3 || !cpf || cpf.trim().length !== 11 || !endereco) {
                return res.status(400).json({ message: "Dados inválidos: Nome, CPF e Endereço são obrigatórios e/ou inválidos" });
            }
            
            // Verifica se o CPF já existe
            const resultadoId = await clienteModel.selecionarPorCPF(cpf); 
            if (resultadoId.length === 1) {
                return res.status(409).json({ message: "Esse CPF ja existe. Tente Outro" });
            }

            // Insere o cliente
            const resultado = await clienteModel.inserircliente(nome_completo, cpf, telefone, email, endereco);

            // Confirma a inserção
            if (resultado.affectedRows === 1 && resultado.insertId !== 0) {
                res.status(201).json({ 
                    message: "Registro incluido com sucesso",
                    result: resultado,
                });
            } else {
                throw new Error("Ocorreu um erro ao inclur o registro");
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: "Ocorreu um erro no servidor",
                errorMessage: error.message,
            });
        }
    },

    /**
     * Atualiza os dados de um cliente existente.
     * Rota: PUT /clientes/:id_cliente
     * @async
     * @function atualizarCliente
     * @param {Request} req Requisição contendo no parâmetro e dados de atualização no corpo.
     * @param {Response} res Resposta HTTP.
     * @returns {Promise<void>} Envia resposta JSON de sucesso ou erro.
     */
    atualizarCliente: async (req, res) => {
        try {
            const id = Number(req.params.id_cliente); 
            const { nome_completo, cpf, telefone, email, endereco } = req.body;

            // Validação de dados
            if (!id || isNaN(id) || !nome_completo || nome_completo.trim().length < 3 || !cpf || cpf.length !== 11 || !endereco) {
                return res.status(400).json({ message: "Verifique os dados enviados e tente novamente" });
            }

            // Verifica se o registro existe
            const clienteAtual = await clienteModel.selecionarPorId(id);
            if (clienteAtual.length === 0) {
                return res.status(404).json({ message: `Registro com ID ${id} não localizado.` });
            }
            
            // Realiza a atualização
            const resultado = await clienteModel.alterarcliente(
                nome_completo, cpf, telefone, email, endereco, id 
            );

            // Confirma linhas afetadas
            if (resultado.affectedRows === 0) {
                throw new Error("Ocorreu um erro ao atualizar o Cliente (0 linhas afetadas)");
            }

            // Mostra o registro atualizado com sucesso
            res.status(200).json({ message: "Registro atualizado com sucesso", data: resultado });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: "Ocorreu um erro no servidor.",
                errorMessage: error.message,
            });
        }
    },

    /**
     * Exclui um cliente pelo seu ID.
     * Rota: DELETE /clientes/:id_cliente
     * @async
     * @function excluirCliente
     * @param {Request} req Requisição contendo nos parâmetros.
     * @param {Response} res Resposta HTTP.
     * @returns {Promise<void>} Envia resposta JSON de sucesso ou erro.
     */
    excluirCliente: async (req, res) => {
        try {
            const id = Number(req.params.id_cliente); 
            
            // Validação do ID
            if (!id || !Number.isInteger(id)) { 
                return res.status(400).json({ message: "Forneça um ID válido" }); 
            }

            // Verifica se o registro existe
            const ClienteSelecionado = await clienteModel.selecionarPorId(id);
            if (ClienteSelecionado.length === 0) {
                return res.status(404).json({ message: `Registro com ID ${id} não localizado.` });
            } 
            
            // Realiza a exclusão
            const resultado = await clienteModel.excluirCliente(id);
            
            // Confirma a exclusão
            if (resultado.affectedRows === 1) {
                res.status(200).json({ message: "Cliente excluído com sucesso", data: resultado });
            } else {
                throw new Error("Não foi possível excluir o Cliente");
            }
            
        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: "Ocorreu um erro no servidor",
                errorMessage: error.message,
            });
        }
    },
};

module.exports = { clienteController };