const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AdSchema = new Schema({
    title: String,
    price: Number,
    description: String,
});

module.exports = mongoose.model('Ad', AdSchema);