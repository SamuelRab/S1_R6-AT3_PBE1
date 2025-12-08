const pool = require("../config/db");

const clienteModel = {

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
    const sql = "SELECT * FROM clientes";
    const [rows] = await pool.query(sql);
    return rows;
  },
 
   /**
   * Seleciona um cliente de acordo com o id_cliente especificado
   * @async
   * @param {number} pId Identificador que deve ser pesquisado no banco de dados
   * @returns {Promise<Array<Object>}
   *
   * @example
   * const cliente = await produtoModel.selceionarPorId(1);
   * console.log(cliente);
   * //Saída esperada
   * [
   *     {nome_completo, cpf, telefone, email, endereco}
   * ]
   */

    selecionarPorId: async (pId) => {
        const sql = "SELECT * FROM clientes WHERE id_cliente =?";
        const values = [pId];
        const [rows] = await pool.query(sql, values);
        return rows;
    },

    /**
   * Seleciona um cliente de acordo com o cpf especificado
   * @async
   * @param {number} pCpf Identificador que deve ser pesquisado no banco de dados
   * @returns {Promise<Array<Object>}
   *
   * @example
   * const cliente = await produtoModel.selceionarPorCpf(49090085866);
   * console.log(cliente);
   * //Saída esperada
   * [
   *     {nome_completo, cpf, telefone, email, endereco}
   * ]
   */
    

    selecionarPorCPF: async (pCpf) => {
        const sql = 'SELECT * FROM clientes WHERE cpf = ?;';
        const values = [pCpf];
        const [rows] = await pool.query(sql, values);
        return rows;
    },

    /**
   * Inclui um cliente novo no banco de dados
   * @param {String} 
   * @param {Number} 
   * @returns {Promise<Object>} Retorna um objeto contendo propriedades que representam as informações do comando executado.
   * @example
   * const cliente = await produtoModel.inserirProduto('Produto teste', 16.90);
   * // Saída
   * "result": {
		"fieldCount": 0,
		"affectedRows": 1,
		"insertId": 7,
		"info": "",
		"serverStatus": 2,
		"warningStatus": 0,
		"changedRows": 0
	  }
   */


    inserircliente: async (pNome, pCpf, pTelefone, pEmail, pEndereco) => {
        const sql = "INSERT INTO clientes (nome_completo, cpf, telefone, email, endereco) VALUES (?, ?, ?, ?, ?)";
        const values = [pNome, pCpf, pTelefone, pEmail, pEndereco];
        const [rows] = await pool.query(sql, values);
        return rows;
    },

    /**
   * Altera um cliente existente banco de dados
   * @param {Number} pId
   * @param {String} pDescricao 
   * @param {Number} pValor 
   * @returns {Promise<Object>} Retorna um objeto contendo propriedades que representam as informações do comando executado.
   * @example
   * const cliente = await produtoModel.alterarProduto(1, 'Produto teste', 16.90);
   * // Saída
   * "result": {
		"fieldCount": 0,
		"affectedRows": 1,
		"insertId": 7,
		"info": "",
		"serverStatus": 2,
		"warningStatus": 0,
		"changedRows": 0
	  }
   */

    alterarcliente: async (pNome, pCpf, pTelefone, pEmail, pEndereco, pId) => {
        const sql = "UPDATE clientes SET nome_completo=?, cpf=?, telefone=?, email=?, endereco=? WHERE id_cliente=?";
        const values = [pNome, pCpf, pTelefone, pEmail, pEndereco, pId];
        const [rows] = await pool.query(sql, values);
        return rows;
    },

    /**
    * Exclui um cliente da base de dados.
    * @async
    * @function excluirCliente
    * @param {number} pId ID do cliente a ser excluído.
    * @returns {Promise<Object>} Objeto contendo linhas afetadas.
    */

    excluirCliente: async (pId) => {
        const sql = "DELETE FROM clientes WHERE id_cliente=?;";
        const values = [pId];
        const [rows] = await pool.query(sql, values);
        return rows;
    }
};

module.exports = { clienteModel };