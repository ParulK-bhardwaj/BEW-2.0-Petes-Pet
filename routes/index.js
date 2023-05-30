const Pet = require('../models/pet');

module.exports = (app) => {
  /* GET home page. */
  // result.docs: the array of records on the current page
  // result.page: the current page
  //result.pages: the total number of pages
  app.get('/', (req, res) => {
    const page = req.query.page || 1

    Pet.paginate({}, { page: page }).then((results) => {
      // If the request is JSON, we want to send a JSON response
      if (req.header('Content-Type') == 'application/json') {
        return res.json({ pets: results.docs, pagesCount: results.pages, currentPage: page });
      // Otherwise we do what we did before
      } else {
        res.render('pets-index', { pets: results.docs, pagesCount: results.pages, currentPage: page });
      }
    });
  });
}
