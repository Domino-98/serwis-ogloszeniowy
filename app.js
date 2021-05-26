const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const favicon = require('serve-favicon');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const { adSchema } = require('./schemas');
const methodOverride = require('method-override');
const Ad = require('./models/ad');
const Category = require('./models/category');


mongoose.connect('mongodb://localhost:27017/serwis-ogloszeniowy', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

app.use(favicon(path.join(__dirname,'public','images','logo.ico')));
app.use('/public', express.static('public')); 

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

const validateAd = (req, res, next) => {
    const result = adSchema.validate(req.body);
    if (result.error) {
        const msg = result.error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}


app.get('/', (req, res) => {
    res.render('home');
});

app.get('/category/:name/ads', async(req,res) => {
    const category = await Category.findOne({"name": req.params.name}).populate('ads');
    res.render('categories/show', { category });
});

app.get('/ads', async (req, res) => {
    const searchQuery = req.query.search;
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        const ads = await Ad.find({title: regex});
        const adsCount = await Ad.count({title: regex});
        let resultText;
        if (adsCount == 1)
            resultText = "ogłoszenie";
         else if (adsCount >= 2 && adsCount <= 4 )
            resultText = "ogłoszenia";
         else if (adsCount > 5 || adsCount == 0)
            resultText = "ogłoszeń";

        res.render('ads/index', { ads, searchQuery, adsCount, resultText});
    } else {
        const ads = await Ad.find({});
        res.render('ads/index', { ads, searchQuery });
    }
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

app.get('/ads/new', (req, res) => {
    res.render('ads/new');
});

app.post('/ads',  validateAd, catchAsync(async (req, res, next) => {
    const ad = new Ad(req.body.ad);
    const category = await Category.findOne({name: req.body.ad.category});
    ad.category = category._id;
    category.ads.push(ad);
    await ad.save();
    await category.save();
    res.redirect(`/ads/${ad._id}`);
}));

app.get('/ads/:id', catchAsync(async (req,res) => {
    const ad = await Ad.findById(req.params.id);
    res.render('ads/show', { ad });
}));

app.get('/ads/:id/edit', catchAsync(async (req,res) =>{
    const ad = await Ad.findById(req.params.id).populate('category');
    res.render(`ads/edit`, { ad });
}));

app.put('/ads/:id', validateAd, catchAsync(async (req,res) => {
    const adOld = await Ad.findById(req.params.id);
    const category = await Category.findOne({_id: adOld.category});
    category.ads.pull({_id: adOld._id});
    category.save();

    const categoryNew = await Category.findOne({name: req.body.ad.category});
    console.log(categoryNew);
    const ad = await Ad.findByIdAndUpdate(req.params.id, { title: req.body.ad.title, price: req.body.ad.price, category: categoryNew._id, description: req.body.ad.description});

    categoryNew.ads.push(ad);
    categoryNew.save();
    
    res.redirect(`/ads/${ad._id}`);
}));

app.delete('/ads/:id', catchAsync(async (req, res) => {
    await Ad.findByIdAndDelete(req.params.id);
    res.redirect('/ads');
}));

app.all('*', (req, res, next) => {
    next(new ExpressError('Nie znaleziono strony', 404));
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Ups... Coś poszło nie tak';
    res.status(statusCode).render('error', { err });
});

app.listen(3000, () => {
    console.log(`Serving on port ${port}`);
});