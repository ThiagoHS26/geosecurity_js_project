import passport from 'passport';
import User from '../models/user.model.js';

const googleAuth = (req, res, next) => {
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        successRedirect: '/api/index',
        failureRedirect: '/', 
    })(req, res, next);
};

const googleAuthCallback = (req, res, next) => {
    passport.authenticate('google', async (err, user, info) => {
        try {
            if (err) {
                console.error('Error en la autenticación:', err);
                return res.status(500).json({ error: 'Authentication failed' });
            }
            if (!user) {
                console.warn('No se encontró el usuario');
                return res.status(401).json({ message: 'No user found' });
            }
            req.logIn(user, (err) => {
                if (err) {
                    console.error('Error en el login:', err);
                    return res.status(500).json({ error: 'Login failed' });
                }
                res.redirect('/api/index');
            });
        } catch (error) {
            console.error('Error en el callback de Google:', error);
            res.status(500).send('Internal Server Error');
        }
    })(req, res, next);
};

// Obtener información del usuario actual
const currentUser = (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
    }
    res.json(req.user);
};

// Cerrar sesión
const logout = (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }
        req.session.destroy(() => {
            res.redirect('/');
        });
    });
};

export {
    googleAuth,
    googleAuthCallback,
    currentUser,
    logout
};
