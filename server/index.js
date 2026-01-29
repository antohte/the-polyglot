const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const db = require('./db');

dotenv.config();

// Route files
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
// const commentRoutes = require('./routes/comments'); // Commented out until we have it
const categoryRoutes = require('./routes/categories');
const eventRoutes = require('./routes/events');
const pollRoutes = require('./routes/polls');
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const statsRoutes = require('./routes/stats');
const reportRoutes = require('./routes/reports');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Static Uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
// app.use('/api/comments', commentRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/reports', reportRoutes);

// Health check
app.get('/', (req, res) => {
    res.send('API is running...');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
