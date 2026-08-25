const mysql = require('mysql2/promise');

exports.handler = async (event, context) => {
    try {
        const gameName = event.queryStringParameters.game;

        // Connect to Aiven MySQL
        const connection = await mysql.createConnection(process.env.AIVEN_DB_URL);

        // Ensure table exists so the page doesn't crash if it's completely empty
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS game_history (
                id BIGINT PRIMARY KEY,
                game VARCHAR(255) NOT NULL,
                party VARCHAR(255),
                play_date VARCHAR(50),
                scores JSON
            )
        `);

        // Fetch records
        let query = 'SELECT * FROM game_history';
        let params = [];

        // If a specific game is requested, filter by it
        if (gameName) {
            query += ' WHERE game = ?';
            params.push(gameName);
        }

        // Sort by newest first
        query += ' ORDER BY play_date DESC, id DESC';

        const [rows] = await connection.execute(query, params);
        await connection.end();

        // Format the SQL data back into JavaScript objects for your HTML charts
        const history = rows.map(row => ({
            id: row.id,
            game: row.game,
            party: row.party,
            date: row.play_date,
            scores: typeof row.scores === 'string' ? JSON.parse(row.scores) : row.scores
        }));

        return {
            statusCode: 200,
            body: JSON.stringify(history)
        };
    } catch (error) {
        console.error('Database Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch from database', details: error.message })
        };
    }
};