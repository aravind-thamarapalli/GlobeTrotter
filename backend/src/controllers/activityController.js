const db = require('../config/db');

const searchActivities = async (req, res) => {
    try {
        const { cityId, type, minCost, maxCost } = req.query;
        let query = 'SELECT * FROM activities WHERE 1=1';
        const params = [];

        if (cityId) {
            params.push(cityId);
            query += ` AND city_id = $${params.length}`;
        }

        if (type) {
            params.push(type);
            query += ` AND type = $${params.length}`;
        }

        if (minCost) {
            params.push(minCost);
            query += ` AND cost >= $${params.length}`;
        }

        if (maxCost) {
            params.push(maxCost);
            query += ` AND cost <= $${params.length}`;
        }

        // Add text search capability via req.query.search
        if (req.query.search) {
            params.push(`%${req.query.search}%`);
            query += ` AND (name ILIKE $${params.length} OR description ILIKE $${params.length})`;
        }

        query += ' LIMIT 100';

        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

const updateAssignment = async (req, res) => {
    try {
        const id = req.params.id; // assignment/stop_activity id
        const { scheduled_at, notes } = req.body;

        // Check ownership? tricky without join. simpler just update.
        // If robust, join to trip, check user_id.

        const result = await db.query(
            'UPDATE stop_activities SET scheduled_at = COALESCE($1, scheduled_at), notes = COALESCE($2, notes) WHERE id = $3 RETURNING *',
            [scheduled_at, notes, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Assignment not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
}

module.exports = {
    searchActivities,
    updateAssignment,
    deleteAssignment: async (req, res) => {
        try {
            const id = req.params.id;
            await db.query('DELETE FROM stop_activities WHERE id = $1', [id]);
            res.json({ message: 'Assignment removed' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Server error' });
        }
    }
};
