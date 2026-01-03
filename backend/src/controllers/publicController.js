const db = require('../config/db');

const getPublicTrip = async (req, res) => {
    try {
        const { slug } = req.params;

        const tripResult = await db.query('SELECT * FROM trips WHERE public_slug = $1 AND is_public = true', [slug]);

        if (tripResult.rows.length === 0) {
            return res.status(404).json({ error: 'Trip not found' });
        }

        const trip = tripResult.rows[0];
        const tripId = trip.id;

        // Exact same logic as getTripById but skipping user check
        const stopsResult = await db.query(`
            SELECT ts.*, c.name as city_name, c.country as city_country, c.image_url as city_image, c.latitude, c.longitude
            FROM trip_stops ts
            JOIN cities c ON ts.city_id = c.id
            WHERE ts.trip_id = $1
            ORDER BY ts.order_index ASC
        `, [tripId]);

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

const copyTrip = async (req, res) => {
    try {
        const { slug } = req.params;
        const userId = req.user.id;

        const tripResult = await db.query('SELECT * FROM trips WHERE public_slug = $1 AND is_public = true', [slug]);
        if (tripResult.rows.length === 0) {
            return res.status(404).json({ error: 'Trip not found' });
        }
        const originalTrip = tripResult.rows[0];

        // Start Transaction
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Create new trip
            const newTripResult = await client.query(
                'INSERT INTO trips (user_id, title, start_date, end_date, cover_photo_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [userId, `Copy of ${originalTrip.title}`, originalTrip.start_date, originalTrip.end_date, originalTrip.cover_photo_url]
            );
            const newTrip = newTripResult.rows[0];

            // 2. Fetch original stops
            const originalStops = await client.query('SELECT * FROM trip_stops WHERE trip_id = $1 ORDER BY order_index ASC', [originalTrip.id]);

            for (const stop of originalStops.rows) {
                // 3. Create new stop
                const newStopResult = await client.query(
                    'INSERT INTO trip_stops (trip_id, city_id, arrival_date, departure_date, order_index, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
                    [newTrip.id, stop.city_id, stop.arrival_date, stop.departure_date, stop.order_index, stop.notes]
                );
                const newStopId = newStopResult.rows[0].id;

                // 4. Fetch original activities for stop
                const originalActivities = await client.query('SELECT * FROM stop_activities WHERE stop_id = $1', [stop.id]);

                for (const activity of originalActivities.rows) {
                    // 5. Create new activity assignment
                    await client.query(
                        'INSERT INTO stop_activities (stop_id, activity_id, scheduled_at, notes) VALUES ($1, $2, $3, $4)',
                        [newStopId, activity.activity_id, activity.scheduled_at, activity.notes]
                    );
                }
            }

            await client.query('COMMIT');
            res.status(201).json(newTrip);

        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    getPublicTrip,
    copyTrip
};
