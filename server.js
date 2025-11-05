const express = require("express");
require('dotenv').config({ path: './.env' });
const cors = require("cors");
const contactRoutes = require("./routes/contact.route");
const careerRoute = require("./routes/career.route");
const quoteRoute = require("./routes/quote.route");
const errorHandler = require("./middlewares/errorHandler");
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.route');
const blogRoutes = require('./routes/blog.route');
const cloudinary = require('cloudinary').v2;

const app = express();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Enable CORS for your production domain
app.use(cors({
  origin: 'https://kynyx.com',  
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
  credentials: true,
  preflightContinue: false,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/contact", contactRoutes);
app.use("/api/get-quote", quoteRoute);
app.use("/api/career", careerRoute)

app.use('/api/auth', authRoutes);
app.use('/api/blog', blogRoutes);

// Global error handler
app.use(errorHandler);

// Database connect
connectDB();

const PORT = process.env.URI_PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.get('/', (req, res) => {
  res.send('Hello, world!');
});