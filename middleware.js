const { adSchema } = require('./schemas');
const ExpressError = require('./utils/ExpressError');
const Ad = require('./models/ad');

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'Musisz być zalogowany!')
        return res.redirect('/login');
    }
    next();
}

module.exports.validateAd = (req, res, next) => {
    const result = adSchema.validate(req.body);
    if (result.error) {
        const msg = result.error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

module.exports.isAuthor = async (req, res, next) => {
    const ad = await Ad.findById(req.params.id);
    if (!ad.author.equals(req.user._id) && req.user.isAdmin == false) {
        req.flash('error', 'Nie masz uprawnień do zaktualizowania tego ogłoszenia!');
        return res.redirect(`/ads/${req.params.id}`);
    }
    next();
}