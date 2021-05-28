module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'Musisz być zalogowany!')
        return res.redirect('/login');
    }
    next();
}