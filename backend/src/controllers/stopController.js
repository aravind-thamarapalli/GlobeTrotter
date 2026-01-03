const db = require('../config/db');

const addStop = async (req, res) => {
    try {
        const tripId = req.params.id;
        const { city_id, arrival_date, departure_date } = req.body;

        // Get current max order index
        const maxOrderResult = await db.query('SELECT MAX(order_index) as max_order FROM trip_stops WHERE trip_id = $1', [tripId]);
        const nextOrder = (maxOrderResult.rows[0].max_order || 0) + 1;

        const result = await db.query(
            'INSERT INTO trip_stops (trip_id, city_id, arrival_date, departure_date, order_index) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [tripId, city_id, arrival_date, departure_date, nextOrder]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

const reorderStops = async (req, res) => {
    try {
        const tripId = req.params.id;
        const { stopIds } = req.body; // Array of stop IDs in new order

        // Transaction might be safer
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');
            // update each stop's order_index
            for (let i = 0; i < stopIds.length; i++) {
                await client.query('UPDATE trip_stops SET order_index = $1 WHERE id = $2 AND trip_id = $3', [i + 1, stopIds[i], tripId]);
            }
            await client.query('COMMIT');
            res.json({ message: 'Stops reordered' });
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

// Start of Activity Logic relative to stops
const addActivity = async (req, res) => {
    try {
        const stopId = req.params.id; // from /api/stops/:id/activities
        const { activity_id, scheduled_at } = req.body;

        const result = await db.query(
            'INSERT INTO stop_activities (stop_id, activity_id, scheduled_at) VALUES ($1, $2, $3) RETURNING *',
            [stopId, activity_id, scheduled_at]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

const deleteStop = async (req, res) => {
    try {
        const stopId = req.params.stopId;
        const tripId = req.params.id; // Correct route parameter mapping needed

        // We delete by ID.
        // Route should properly be DELETE /api/trips/:tripId/stops/:stopId OR DELETE /api/stops/:id
        // Let's assume DELETE /api/stops/:id for simplicity in routing, but checking ownership is harder without trip context if we don't look it up.

        // Simpler: DELETE /api/stops/:id
        await db.query('DELETE FROM trip_stops WHERE id = $1', [stopId]);
        res.json({ message: 'Stop deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    addStop,
    reorderStops,
    addActivity,
    deleteStop
};
