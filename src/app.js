import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import session from 'express-session';
import MongoStore from 'connect-mongo';
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

//Manejo de sesiones
app.use(session({
  secret: process.env.SESSION_SECRET, // Cambia por tu clave secreta real
  resave: false, 
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    ttl: 14 * 24 * 60 * 60 // 14 días
  }),
  cookie: { secure: false } // Cambia a "true" si usas HTTPS
}));

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

/* MIDDLEWARES */
app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('dev'));

//Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

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
