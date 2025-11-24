const mysql = require('mysql2/promise')

const pool = mysql.createPool({
    host: '10.87.169.65',
    user: 'samuel',
    password: 'MySQL1234',
    database: 'logisticacomercio', 
    port: 3308,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Conectado ao MySQL')
        connection.release()
    } catch (error) {
        console.error('Erro ao conectar ao MySQL: ${error}');
    }
})();


module.exports = pool;