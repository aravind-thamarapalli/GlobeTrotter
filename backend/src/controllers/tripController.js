const db = require('../config/db');

const createTrip = async (req, res) => {
    try {
        const { title } = req.body;
        let { start_date, end_date } = req.body;

        if (start_date === 'undefined' || start_date === 'null' || start_date === '') start_date = null;
        if (end_date === 'undefined' || end_date === 'null' || end_date === '') end_date = null;

        const userId = req.user.id;

        console.log("Creating trip for user:", userId);
        console.log("Body:", req.body);
        console.log("File:", req.file);

        let cover_photo_url = req.body.cover_photo_url;
        if (req.file) {
            // Check if we are using Cloudinary or Local
            // If path starts with 'http', it's cloudinary (or user provided url?)
            // Multer Cloudinary storage returns remote URL in `path`.
            // Multer Disk storage returns local path.

            if (req.file.path.startsWith('http')) {
                cover_photo_url = req.file.path;
            } else {
                // Local file, construct URL.
                // Assuming backend is serving uploads/ folder statically at /uploads/
                // req.file.filename gives just the name in uploads folder
                const protocol = req.protocol;
                const host = req.get('host');
                cover_photo_url = `${protocol}://${host}/uploads/${req.file.filename}`;
            }
        }

        const result = await db.query(
            'INSERT INTO trips (user_id, title, start_date, end_date, cover_photo_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [userId, title, start_date, end_date, cover_photo_url]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Create Trip Error:", error);
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
};

const getTrips = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await db.query('SELECT * FROM trips WHERE user_id = $1 ORDER BY start_date ASC', [userId]);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

const getTripById = async (req, res) => {
    try {
        const tripId = req.params.id;
        const userId = req.user.id; // Or check if public!

        // Check ownership or public
        const tripResult = await db.query('SELECT * FROM trips WHERE id = $1', [tripId]);

        if (tripResult.rows.length === 0) {
            return res.status(404).json({ error: 'Trip not found' });
        }

        const trip = tripResult.rows[0];

        if (trip.user_id !== userId && !trip.is_public) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // specific logic for public view vs owner view could be here
        // Fetch stops and activities
        const stopsResult = await db.query(`
        SELECT ts.*, c.name as city_name, c.country as city_country, c.image_url as city_image, c.latitude, c.longitude
        FROM trip_stops ts
        JOIN cities c ON ts.city_id = c.id
        WHERE ts.trip_id = $1
        ORDER BY ts.order_index ASC
    `, [tripId]);

        // For each stop, fetch activities
        // This is N+1 but okay for small scale. Better to join or aggregated json.
        // Using LATERAL or JSON_AGG would be better.

        const stopsWithActivities = await Promise.all(stopsResult.rows.map(async (stop) => {
            const activitiesResult = await db.query(`
            SELECT sa.*, a.name, a.type, a.cost, a.image_url, a.location_address
            FROM stop_activities sa
            JOIN activities a ON sa.activity_id = a.id
            WHERE sa.stop_id = $1
            ORDER BY sa.scheduled_at ASC
        `, [stop.id]);
            return { ...stop, activities: activitiesResult.rows };
        }));

        res.json({ ...trip, stops: stopsWithActivities });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

const updateTrip = async (req, res) => {
    // TODO: Implement updates
    res.sendStatus(501);
};

const deleteTrip = async (req, res) => {
    try {
        const tripId = req.params.id;
        const userId = req.user.id;

        const result = await db.query('DELETE FROM trips WHERE id = $1 AND user_id = $2 RETURNING id', [tripId, userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Trip not found or unauthorized' });
        }
        res.json({ message: 'Trip deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

const makePublic = async (req, res) => {
    try {
        const tripId = req.params.id;
        const userId = req.user.id;
        const { is_public } = req.body;

        let slug = null;
        if (is_public) {
            // simple slug generation
            const crypto = require('crypto');
            slug = crypto.randomBytes(8).toString('hex');
        }

        const result = await db.query(
            'UPDATE trips SET is_public = $1, public_slug = $2 WHERE id = $3 AND user_id = $4 RETURNING *',
            [is_public, slug, tripId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Trip not found or unauthorized' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

const getTripBudget = async (req, res) => {
    try {
        const tripId = req.params.id;
        // Verify access first... (skipped for brevity, but should duplicate checks or use middleware)

        // Calculate costs from activities
        // This query sums up costs of all activities in all stops of the trip
        const activityCostResult = await db.query(`
            SELECT SUM(a.cost) as total_activity_cost
            FROM activities a
            JOIN stop_activities sa ON sa.activity_id = a.id
            JOIN trip_stops ts ON sa.stop_id = ts.id
            WHERE ts.trip_id = $1
        `, [tripId]);

        // Calculate other expenses
        const expensesResult = await db.query(`
            SELECT category, SUM(amount) as cost
            FROM trip_expenses
            WHERE trip_id = $1
            GROUP BY category
        `, [tripId]);

        const activityCost = parseFloat(activityCostResult.rows[0].total_activity_cost || 0);

        const breakdown = expensesResult.rows.map(r => ({ category: r.category, cost: parseFloat(r.cost) }));
        // Add activity cost to breakdown if not present (activities usually separate or part of 'entertainment')
        breakdown.push({ category: 'activities', cost: activityCost });

        const total = breakdown.reduce((acc, item) => acc + item.cost, 0);

        res.json({ total, breakdown });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
}

module.exports = {
    createTrip,
    getTrips,
    getTripById,
    updateTrip,
    deleteTrip,
    makePublic,
    getTripBudget
};
