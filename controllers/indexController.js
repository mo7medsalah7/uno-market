exports.getHomePage = async (req, res, next) => {
  await res.render("index", {
    isLoggedIn: req.isAuthenticated()
  });
};
