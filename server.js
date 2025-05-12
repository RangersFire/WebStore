require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const methodOverride = require('method-override');
const ejsLayouts = require('express-ejs-layouts');

const connectDB = require('./config/database');
const User = require('./models/user');
const indexRoutes = require('./routes/indexRoutes');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

const { isNotBanned } = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions'
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

// Middleware untuk mengambil data user dan role jika login
// Dan cek apakah user dibanned pada setiap request
app.use(async (req, res, next) => {
  if (req.session.userId) {
    try {
      const user = await User.findById(req.session.userId).select('-password');
      if (user) {
        res.locals.currentUser = user; // Buat currentUser tersedia di semua view EJS
        if (user.isBanned) {
          req.session.destroy((err) => {
            if (err) console.error("Session destroy error:", err);
            // Mungkin tambahkan pesan flash di sini jika pakai connect-flash
            return res.redirect('/auth/login'); // Paksa logout jika dibanned
          });
          return; // Hentikan proses lebih lanjut
        }
      } else {
        // User tidak ditemukan, mungkin session lama
        req.session.destroy();
        res.locals.currentUser = null;
      }
    } catch (error) {
      console.error("Error fetching user for session:", error);
      res.locals.currentUser = null;
    }
  } else {
    res.locals.currentUser = null;
  }
  next();
});

// Templating Engine EJS
app.use(ejsLayouts);
app.set('layout', './layouts/main'); // default layout
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// Routes
app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);

// Basic 404
app.use((req, res) => {
    res.status(404).render('404', { title: 'Page Not Found', layout: './layouts/main' }); // Pastikan ada view 404.ejs
});

// Basic Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('500', { title: 'Server Error', error: err, layout: './layouts/main' }); // Pastikan ada view 500.ejs
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});