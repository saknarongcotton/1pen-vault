const mysql = require('mysql2/promise');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const data = JSON.parse(event.body);
        const { id, game, party, date, scores } = data;

        const connection = await mysql.createConnection(process.env.AIVEN_DB_URL);

        await connection.execute(`
            CREATE TABLE IF NOT EXISTS game_history (
                id BIGINT PRIMARY KEY,
                game VARCHAR(255) NOT NULL,
                party VARCHAR(255),
                play_date VARCHAR(50),
                scores JSON
            )
        `);

        // INSERT OR UPDATE ON EXISTING ID
        await connection.execute(
            `INSERT INTO game_history (id, game, party, play_date, scores) 
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE party = VALUES(party), play_date = VALUES(play_date), scores = VALUES(scores)`,
            [id, game, party, date, JSON.stringify(scores)]
        );

        await connection.end();

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Game saved/updated successfully!" })
        };
    } catch (error) {
        console.error('Database Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
