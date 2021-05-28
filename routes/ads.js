const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { adSchema } = require('../schemas');
const { isLoggedIn } = require('../middleware');
const ExpressError = require('../utils/ExpressError');
const Ad = require('../models/ad');
const Category = require('../models/category');


const validateAd = (req, res, next) => {
    const result = adSchema.validate(req.body);
    if (result.error) {
        const msg = result.error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}


router.get('/', async (req, res) => {
    const limit = parseInt(req.query.limit) || 9;
    const page = parseInt(req.query.page) || 1;
    const searchQuery = req.query.search;
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        const ads = await Ad.paginate({title: regex}, {limit: limit, page: page});
        const adsCount = await Ad.count({title: regex});
        let resultText;
        if (adsCount == 1)
            resultText = "ogłoszenie";
         else if (adsCount >= 2 && adsCount <= 4 )
            resultText = "ogłoszenia";
         else if (adsCount >= 5 || adsCount == 0)
            resultText = "ogłoszeń";
        res.render('ads/index', { ads, searchQuery, adsCount, resultText});
    } else {
        const ads = await Ad.paginate({}, {limit: limit, page: page});
        res.render('ads/index', { ads, searchQuery });
    }
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

router.get('/new', isLoggedIn, (req, res) => {
    res.render('ads/new');
});

router.post('/',  isLoggedIn, validateAd, catchAsync(async (req, res, next) => {
    const ad = new Ad(req.body.ad);
    const category = await Category.findOne({name: req.body.ad.category});
    ad.category = category._id;
    category.ads.push(ad);
    await ad.save();
    await category.save();
    req.flash('success', 'Pomyślnie utworzono nowe ogłoszenie!')
    res.redirect(`/ads/${ad._id}`);
}));

router.get('/:id', catchAsync(async (req,res) => {
    const ad = await Ad.findById(req.params.id);
    if (!ad) {
        req.flash('error', 'Nie można znaleźć ogłoszenia o podanym id');
        return res.redirect('/ads');
    }
    res.render('ads/show', { ad });
}));

router.get('/:id/edit', isLoggedIn, catchAsync(async (req,res) =>{
    const ad = await Ad.findById(req.params.id).populate('category');
    if (!ad) {
        req.flash('error', 'Nie można znaleźć ogłoszenia o podanym id');
        return res.redirect('/ads');
    }
    res.render(`ads/edit`, { ad });
}));

router.put('/:id', isLoggedIn, validateAd, catchAsync(async (req,res) => {
    const adOld = await Ad.findById(req.params.id);
    const category = await Category.findOne({_id: adOld.category});
    category.ads.pull({_id: adOld._id});
    category.save();

    const categoryNew = await Category.findOne({name: req.body.ad.category});
    const ad = await Ad.findByIdAndUpdate(req.params.id, { title: req.body.ad.title, price: req.body.ad.price, category: categoryNew._id, description: req.body.ad.description, contactNumber: req.body.ad.contactNumber, location: req.body.ad.location});

    categoryNew.ads.push(ad);
    categoryNew.save();

    req.flash('success', 'Pomyślnie zaktualizowano ogłoszenie!')
    res.redirect(`/ads/${ad._id}`);
}));

router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
    await Ad.findByIdAndDelete(req.params.id);
    req.flash('success', 'Pomyślnie usunięto ogłoszenie!')
    res.redirect('/ads');
}));

module.exports = router;