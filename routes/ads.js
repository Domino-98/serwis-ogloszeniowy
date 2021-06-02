const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, validateAd, isAuthor } = require('../middleware');
const Ad = require('../models/ad');
const Category = require('../models/category');

let page = '';
let searchQuery = '';
let url = '';


router.get('/category/:name', async(req,res) => {
    url = req.originalUrl;
    module.exports.url = url;
    const limit = parseInt(req.query.limit) || 9;
    page = parseInt(req.query.page) || 1;
    const category = await Category.findOne({name: req.params.name});
    const categoryAds = await Ad.paginate({'category': category._id}, {limit: limit, page: page});
    res.render('categories/show', { categoryAds, category });
});

router.get('/', async (req, res) => {
    const limit = parseInt(req.query.limit) || 9;
    page = parseInt(req.query.page) || 1;
    searchQuery = req.query.search;
    module.exports.page = page;
    module.exports.searchQuery = searchQuery;
    url = req.originalUrl;
    module.exports.url = url;
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        const ads = await Ad.paginate({title: regex}, {limit: limit, page: page});
        const adsCount = await Ad.countDocuments({title: regex});
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
        return res.render('ads/index', { ads, searchQuery });
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
    ad.author = req.user._id;
    const category = await Category.findOne({name: req.body.ad.category});
    ad.category = category._id;
    category.ads.push(ad);
    await ad.save();
    await category.save();
    req.flash('success', 'Pomyślnie utworzono nowe ogłoszenie!')
    res.redirect(`/${ad._id}`);
}));

router.get('/:id', catchAsync(async (req,res) => {
    url = req.originalUrl;
    module.exports.url = url;
    const ad = await Ad.findById(req.params.id).populate('author');
    if (!ad) {
        req.flash('error', 'Nie można znaleźć ogłoszenia o podanym id');
        return res.redirect('/');
    }
    res.render('ads/show', { ad });
}));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req,res) => {
    const ad = await Ad.findById(req.params.id).populate('category');
    if (!ad.author.equals(req.user._id)) {
        req.flash('error', 'Nie masz uprawnień do zaktualizowania tego ogłoszenia!');
        return res.redirect(`/${req.params.id}`);
    }
    res.render(`ads/edit`, { ad });
}));

router.put('/:id', isLoggedIn, isAuthor, validateAd, catchAsync(async (req,res) => {
    const ad = await Ad.findById(req.params.id);
    const category = await Category.findOne({_id: ad.category});
    category.ads.pull({_id: ad._id});
    category.save();
    const categoryNew = await Category.findOne({name: req.body.ad.category});
    const adNew = await Ad.findByIdAndUpdate(req.params.id, { title: req.body.ad.title, price: req.body.ad.price, category: categoryNew._id, description: req.body.ad.description, contactNumber: req.body.ad.contactNumber, location: req.body.ad.location});

    categoryNew.ads.push(adNew);
    categoryNew.save();

    req.flash('success', 'Pomyślnie zaktualizowano ogłoszenie!')
    res.redirect(`/${ad._id}`);
}));

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    await Ad.findByIdAndDelete(req.params.id);
    req.flash('success', 'Pomyślnie usunięto ogłoszenie!')
    res.redirect('/');
}));

module.exports = router;