const express = require('express');
const router = express.Router();
const Ad = require('../models/ad');
const User = require('../models/user');

router.get('/', async(req, res) => {
    if (!req.user) {
        req.flash('error', 'Musisz być zalogowany');
        return res.redirect('/ads');
    }
    const ads = await Ad.find({'author': {'_id':  req.user._id}}).populate('author');
    res.render('ads/my-ads', { ads });
});

module.exports = router;