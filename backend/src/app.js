const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

dotenv.config();

// Routes
const authRoutes = require('./routes/authRoutes');
const tripRoutes = require('./routes/tripRoutes');
const cityRoutes = require('./routes/cityRoutes');
const activityRoutes = require('./routes/activityRoutes');
const stopRoutes = require('./routes/stopRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const publicRoutes = require('./routes/publicRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/stops', stopRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/saved-cities', require('./routes/savedCityRoutes'));
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
    res.send('GlobeTrotter API is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("=========== GLOBAL ERROR HANDLER ===========");
    console.error("Request:", req.method, req.originalUrl);
    console.error("Error Stack:", err.stack);
    console.error("Error Detail:", err);
    console.error("============================================");
    res.status(500).json({ error: 'Something went wrong: ' + err.message });
});

module.exports = app;
