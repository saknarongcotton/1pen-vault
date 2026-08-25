const mysql = require('mysql2/promise');

exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const data = JSON.parse(event.body);
        const { id, game, party, date, scores } = data;

        // Connect to Aiven MySQL using your secret Environment Variable
        const connection = await mysql.createConnection(process.env.AIVEN_DB_URL);

        // Auto-create the table if it doesn't exist yet!
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS game_history (
                id BIGINT PRIMARY KEY,
                game VARCHAR(255) NOT NULL,
                party VARCHAR(255),
                play_date VARCHAR(50),
                scores JSON
            )
        `);

        // Insert the new game record
        await connection.execute(
            `INSERT INTO game_history (id, game, party, play_date, scores) VALUES (?, ?, ?, ?, ?)`,
            [id, game, party, date, JSON.stringify(scores)]
        );

        await connection.end();

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Game saved successfully to the cloud!" })
        };
    } catch (error) {
        console.error('Database Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to save to database', details: error.message })
        };
    }
};