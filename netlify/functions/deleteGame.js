const mysql = require('mysql2/promise');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { id } = JSON.parse(event.body);
        if (!id) return { statusCode: 400, body: 'Missing ID' };

        const connection = await mysql.createConnection(process.env.AIVEN_DB_URL);
        await connection.execute('DELETE FROM game_history WHERE id = ?', [id]);
        await connection.end();

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Game deleted successfully!" })
        };
    } catch (error) {
        console.error('Database Delete Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
