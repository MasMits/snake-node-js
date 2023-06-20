require('dotenv').config()

const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); // Додайте PUT до дозволених методів
    next();
});
app.use(express.json());
const port = 3001;

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL + "?sslmode=require",
})

pool.connect((err) => {
    if (err) throw err
    console.log("Connect to PostgreSQL successfully!")
})


app.get('/players', (req, res) => {
    pool.query('SELECT * FROM players', (error, results) => {
        if (error) {
            throw error;
        }
        const topFivePlayers = results.rows.sort((a, b) => b.score - a.score).slice(0,5);
        res.json(topFivePlayers);
    });
});

app.put('/players', (req, res) => {
    const { name, score } = req.body;
    if (!name || !score) {
        res.status(400).json({ error: 'Name and score are required' });
        return;
    }

    const query = {
        text: 'INSERT INTO players (name, score) VALUES ($1, $2)',
        values: [name, score],
    };
    pool.query(query)
        .then(() => {
            res.status(201).json({ message: 'Player added successfully' });
        })
        .catch((error) => {
            res.status(500).json({ error: 'Internal server error' + error });
        });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
