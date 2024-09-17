import express from 'express';
import session from 'express-session';
import passport from 'passport';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectMongoDB } from './config/database.js';
import userRoutes from './routes/user.route.js';
import authRoutes from './routes/auth-google.route.js';
import criminalRoutes from './routes/criminalCases.route.js'
import dotenv from 'dotenv';
import './middleware/passport-setup.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

connectMongoDB();

// Configurar middleware de sesión
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}));

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('dev'));

//Vistas
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

// Página principal
app.get('/', (req, res) => {
  res.render('pages/login');
});
app.get('/api/index', (req, res) => {
  if (req.isAuthenticated()) {
    res.render('pages/index', { user: req.user });
  } else {
    res.redirect('/');
  }
});

// Rutas
app.use('/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api', criminalRoutes);

export default app;
