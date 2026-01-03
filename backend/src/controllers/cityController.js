const db = require('../config/db');

const searchCities = async (req, res) => {
    try {
        const { search, country } = req.query;
        let query = 'SELECT * FROM cities WHERE 1=1';
        const params = [];

        if (search) {
            params.push(`%${search}%`);
            query += ` AND (name ILIKE $${params.length} OR description ILIKE $${params.length})`;
        }

        if (country) {
            params.push(country);
            query += ` AND country = $${params.length}`;
        }

        query += ' LIMIT 50';

        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    searchCities,
};
