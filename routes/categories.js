const express = require('express');
const router = express.Router();
const Category = require('../models/category');

router.get('/:name/ads', async(req,res) => {
    const category = await Category.findOne({"name": req.params.name}).populate('ads');
    res.render('categories/show', { category });
});

module.exports = router;