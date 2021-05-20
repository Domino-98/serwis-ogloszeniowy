const express = require('express');
const app = express();
const port = 3000;
const sass = require('node-sass');
const path = require('path');
const favicon = require('serve-favicon');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
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

app.post('/ads', async (req, res) => {
    const ad = new Ad(req.body.ad);
    await ad.save();
    res.redirect(`/ads/${ad._id}`);
});

app.get('/ads/:id', async (req,res) => {
    const ad = await Ad.findById(req.params.id);
    res.render('ads/show', { ad });
});

app.get('/ads/:id/edit', async (req,res) =>{
    const ad = await Ad.findById(req.params.id);
    res.render(`ads/edit`, { ad });
});

app.put('/ads/:id', async (req,res) => {
    const ad = await Ad.findByIdAndUpdate(req.params.id, { ...req.body.ad });
    res.redirect(`/ads/${ad._id}`);
});

app.delete('/ads/:id', async (req, res) => {
    await Ad.findByIdAndDelete(req.params.id);
    res.redirect('/ads');
});

app.listen(3000, () => {
    console.log(`Serving on port ${port}`);
});