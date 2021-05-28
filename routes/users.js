const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const passport = require('passport');
const User = require('../models/user');

router.get('/register', (req, res) => {
    res.render('users/register');
});

router.post('/register', catchAsync(async (req, res) => {
    try {
        const {email, username, password} = req.body;
        const user = new User({email, username, password});
        const registeredUser = await User.register(user, password);
        req.flash('success', 'Witaj w serwisie ogłoszeniowym ADBOX!');
        res.redirect('/ads');
    } catch(e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
}));

router.get('/login', (req, res) => {
    res.render('users/login');
});

router.post('/login', passport.authenticate('local', {failureFlash: 'Niepoprawny adres email lub hasło', failureRedirect: '/login'}), catchAsync(async (req, res) => {
    req.flash('success', 'Witamy z powrotem!');
    res.redirect('/ads');
}));

module.exports = router;