const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Ad = require('../models/ad');
const User = require('../models/user');

let currentPage = require('../routes/ads');


router.get('/', async(req, res) => {
    if (!req.user) {
        req.flash('error', 'Musisz być zalogowany');
        return res.redirect('/ads');
    }

    const userWatchedAds = await User.findOne({_id: req.user._id}).populate('watchedAds');

    res.render('ads/watched', { userWatchedAds });
});

router.get('/:id/add', async(req, res) => {
    const ad = await Ad.findOne({_id: req.params.id});
    if (!req.user) {
        console.log(currentPage.editUrl);
        req.flash('error', 'Musisz być zalogowany aby móc dodać ogłoszenie do obserwowanych');
        checkUrlAndRedirect();
    }

    const loggedUser = await User.findOne({_id: req.user._id});
    const adToAdd = await User.findOne({_id: req.user._id, 'watchedAds': ad._id});

    if (adToAdd == null) {    
        loggedUser.watchedAds.push(ad);
        await loggedUser.save();
        req.flash('success', 'Dodano ogłoszenie do obserwowanych');
        checkUrlAndRedirect();
    } else {
        req.flash('error', 'Te ogłoszenie jest już w twoich obserwowanych');
        checkUrlAndRedirect();
    }

    function checkUrlAndRedirect() {
        if (currentPage.url == `/ads/${ad._id}`) {
            return res.redirect(`/ads/${ad._id}`);
        } else {
            if (currentPage.searchQuery) {
                return res.redirect(`/ads/?page=${currentPage.page}&search=${currentPage.searchQuery}#ads`);
            }
            return res.redirect(`/ads/?page=${currentPage.page}#ads`);
        }
    }
});

router.get('/:id/remove', async(req, res) => {
    if (!req.user) {
        req.flash('error', 'Musisz być zalogowany aby móc usunąć ogłoszenie');
        return res.redirect('/ads#');
    }

    const ad = await Ad.findOne({_id: req.params.id});
    const loggedUser = await User.findOne({_id: req.user._id});
    const adToRemove = await User.findOne({'watchedAds': mongoose.Types.ObjectId(ad._id)});
    adToRemove.watchedAds.pull({_id: mongoose.Types.ObjectId(ad._id)});
    await adToRemove.save();
    req.flash('success', 'Usunięto ogłoszenie z obserwowanych');
    res.redirect('/watched');
});


module.exports = router;