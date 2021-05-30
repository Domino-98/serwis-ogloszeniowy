const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const Category = require('./category');
const Schema = mongoose.Schema;

const AdSchema = new Schema({
    title: String,
    price: Number,
    description: String,
    contactNumber: Number,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    category:  {
        type: Schema.Types.ObjectId,
        ref: "Category"
    }
}, {
    timestamps: true,
});

AdSchema.plugin(mongoosePaginate);

AdSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        const category = await Category.findOne({'ads': mongoose.Types.ObjectId(doc._id)});
        category.ads.pull({_id: mongoose.Types.ObjectId(doc._id)});
        category.save();
    }
});

module.exports = mongoose.model('Ad', AdSchema);