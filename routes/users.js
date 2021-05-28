const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const passport = require('passport');
const User = require('../models/user');

router.get('/register', (req, res) => {
    res.render('users/register');
});

router.post('/register', catchAsync(async (req, res, next) => {
    const {email, username, password} = req.body;
    try {
        const user = new User({email, username, password});
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Witaj w serwisie ogłoszeniowym ADBOX!');
            res.redirect('/ads');
        })
    } catch(e) {
        let msg = '';
        const foundUserEmail = await User.findOne({email: email});
        const foundUserName = await User.findOne({username: username});
        if (foundUserEmail) {
            msg = 'Użytkownik o podanym mailu już istnieje';
        }
        if (foundUserName) {
            msg = 'Użytkownik o podanej nazwie już istnieje';
        }
        req.flash('error', msg);
        res.redirect('register');
    }
}));

router.get('/login', (req, res) => {
    res.render('users/login');
});

router.post('/login', passport.authenticate('local', {failureFlash: 'Niepoprawny adres email lub hasło', failureRedirect: '/login'}), catchAsync(async (req, res) => {
    req.flash('success', 'Witamy z powrotem!');
    const redirectUrl = req.session.returnTo || '/ads';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}));


router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'Zostałeś pomyślnie wylogowany');
    res.redirect('/ads');
});


module.exports = router;