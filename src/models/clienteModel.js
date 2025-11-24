const pool = require("../config/db");

const clienteModel = {
    selecionarTodos: async () => {
        const sql = "SELECT * FROM clientes";
        const [rows] = await pool.query(sql);
        return rows;
    },

    selecionarPorId: async (pId) => {
        const sql = "SELECT * FROM clientes WHERE id_cliente =?";
        const values = [pId];
        const [rows] = await pool.query(sql, values);
        return rows;
    },

    selecionarPorCPF: async (pCpf) => {
        const sql = 'SELECT * FROM clientes WHERE cpf = ?;';
        const values = [pCpf];
        const [rows] = await pool.query(sql, values);
        return rows;
    },

    inserircliente: async (pNome, pCpf, pTelefone, pEmail, pEndereco) => {
        const sql = "INSERT INTO clientes (nome_completo, cpf, telefone, email, endereco) VALUES (?, ?, ?, ?, ?)";
        const values = [pNome, pCpf, pTelefone, pEmail, pEndereco];
        const [rows] = await pool.query(sql, values);
        return rows;
    },

    alterarcliente: async (pNome, pCpf, pTelefone, pEmail, pEndereco, pId) => {
        const sql = "UPDATE clientes SET nome_completo=?, cpf=?, telefone=?, email=?, endereco=? WHERE id_cliente=?";
        const values = [pNome, pCpf, pTelefone, pEmail, pEndereco, pId];
        const [rows] = await pool.query(sql, values);
        return rows;
    },

    excluirCliente: async (pId) => {
        const sql = "DELETE FROM clientes WHERE id_cliente=?;";
        const values = [pId];
        const [rows] = await pool.query(sql, values);
        return rows;
    }
};

module.exports = { clienteModel };