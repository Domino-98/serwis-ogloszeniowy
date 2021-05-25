const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
    name: {
        type: String,
        required: [true, 'Wymagana nazwa kategorii'],
    },
    ads: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Ad'
        }
    ]
})


module.exports = mongoose.model('Category', categorySchema);