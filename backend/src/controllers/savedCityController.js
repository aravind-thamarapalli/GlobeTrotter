const db = require('../config/db');

const getSavedCities = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await db.query(`
            SELECT c.* 
            FROM cities c
            JOIN saved_cities sc ON c.id = sc.city_id
            WHERE sc.user_id = $1
        `, [userId]);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

const saveCity = async (req, res) => {
    try {
        const userId = req.user.id;
        const { city_id } = req.body;

        await db.query(`
            INSERT INTO saved_cities (user_id, city_id)
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING
        `, [userId, city_id]);

        res.status(201).json({ message: 'City saved' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

const unsaveCity = async (req, res) => {
    try {
        const userId = req.user.id;
        const { cityId } = req.params;

        await db.query(`
            DELETE FROM saved_cities
            WHERE user_id = $1 AND city_id = $2
        `, [userId, cityId]);

        res.json({ message: 'City removed from saved' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    getSavedCities,
    saveCity,
    unsaveCity
};
