const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AdSchema = new Schema({
    title: String,
    price: Number,
    description: String,
    category:  {
        type: Schema.Types.ObjectId,
        ref: "Category"
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Ad', AdSchema);