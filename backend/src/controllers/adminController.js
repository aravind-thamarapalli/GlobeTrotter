const db = require('../config/db');

const getStats = async (req, res) => {
    try {
        const userCount = await db.query('SELECT COUNT(*) FROM users');
        const tripCount = await db.query('SELECT COUNT(*) FROM trips');
        const cityCount = await db.query('SELECT COUNT(*) FROM cities');
        const activityCount = await db.query('SELECT COUNT(*) FROM activities');

        // Most popular cities (top 5)
        const popularCities = await db.query(`
        SELECT c.name, COUNT(ts.id) as visit_count
        FROM cities c
        JOIN trip_stops ts ON ts.city_id = c.id
        GROUP BY c.id
        ORDER BY visit_count DESC
        LIMIT 5
    `);

        res.json({
            users: parseInt(userCount.rows[0].count),
            trips: parseInt(tripCount.rows[0].count),
            cities: parseInt(cityCount.rows[0].count),
            activities: parseInt(activityCount.rows[0].count),
            popularCities: popularCities.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    getStats,
};
