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
const Ad = require('./models/ads');


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

app.get('/ads', async (req, res) => {
    const ads = await Ad.find({});
    res.render('ads/index', { ads });
});

app.get('/ads/new', (req, res) => {
    res.render('ads/new');
});

app.post('/ads', validateAd, catchAsync(async (req, res, next) => {
    const ad = new Ad(req.body.ad);
    await ad.save();
    res.redirect(`/ads/${ad._id}`);
}));

app.get('/ads/:id', catchAsync(async (req,res) => {
    const ad = await Ad.findById(req.params.id);
    res.render('ads/show', { ad });
}));

app.get('/ads/:id/edit', catchAsync(async (req,res) =>{
    const ad = await Ad.findById(req.params.id);
    res.render(`ads/edit`, { ad });
}));

app.put('/ads/:id', validateAd, catchAsync(async (req,res) => {
    const ad = await Ad.findByIdAndUpdate(req.params.id, { ...req.body.ad });
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