const express = require('express');
const app = express();
const port = 3000;
const path = require('path');

app.use('/public', express.static('public')); 

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
    res.render('home');
});

app.listen(3000, () => {
    console.log(`Serving on port ${port}`);
});