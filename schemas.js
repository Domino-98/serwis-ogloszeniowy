const Joi = require("joi");
module.exports.adSchema = Joi.object({
  ad: Joi.object({
    title: Joi.string().max(60).required(),
    category: Joi.string().required(),
    price: Joi.string()
      .min(0)
      .max(12)
      .pattern(/^[0-9]+$/)
      .required(),
    description: Joi.string().max(1000).required(),
    contactNumber: Joi.string()
      .min(9)
      .max(15)
      .pattern(/^[0-9]+$/)
      .required(),
    location: Joi.string().max(40).required(),
  }).required(),
  deleteImages: Joi.array(),
});
