const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const rateLimit = require('express-rate-limit');

// Limite à 5 tentatives toutes les 15 minutes
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 5, 
    message: { message: 'Trop de tentatives de connexion, veuillez réessayer dans 15 minutes.' }
});

router.post('/register', authController.register);
router.post('/login', loginLimiter, authController.login);

module.exports = router;
