const Joi = require('joi');
module.exports.adSchema = Joi.object({
    ad: Joi.object({
        title: Joi.string().required(),
        category: Joi.string().required(),
        price: Joi.number().required().min(0),
        description: Joi.string().required(),
        contactNumber: Joi.string().trim().regex(/^[0-9]+$/).min(6).max(10),
        location: Joi.string().required()
    }).required()
});