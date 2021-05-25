const Joi = require('joi');

module.exports.adSchema = Joi.object({
    ad: Joi.object({
        title: Joi.string().required(),
        category: Joi.string().required(),
        price: Joi.number().required().min(0),
        description: Joi.string().required()
    }).required()
});