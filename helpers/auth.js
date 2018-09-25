module.exports = {
  ensureNotAuthenticated: function(req, res, next){
    if(!req.isAuthenticated()){
      return next();
      
    }
    res.redirect('/');
  },
  ensureIsAuthenticated: function(req, res, next){
    if(req.isAuthenticated()){
      return next();
      
    }
    res.redirect('/');
  },
  ensureCompletedAccount: function(req, res, next){
    if (!res.locals.user.telephone) {
      req.flash('error', "veuillez completer votre compte avant d'effectuer la reservation");
      res.redirect('/account/profil');
    } else {
      return next();
    }
    
  }

}
