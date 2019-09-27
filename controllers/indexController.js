exports.getHomePage = (req, res, next) => {
  res.render("index", {
    isLoggedIn: req.isAuthenticated()
  });
};
