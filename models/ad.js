const mongoose = require('mongoose');
const Category = require('./category');
const Schema = mongoose.Schema;

const AdSchema = new Schema({
    title: String,
    price: Number,
    description: String,
    contactNumber: Number,
    location: String,
    category:  {
        type: Schema.Types.ObjectId,
        ref: "Category"
    }
}, {
    timestamps: true,
});

AdSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        const category = await Category.findOne({'ads': mongoose.Types.ObjectId(doc._id)});
        category.ads.pull({_id: mongoose.Types.ObjectId(doc._id)});
        category.save();
    }
});

module.exports = mongoose.model('Ad', AdSchema);