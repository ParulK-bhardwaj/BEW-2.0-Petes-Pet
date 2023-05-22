const Pet = require('../models/pet');

module.exports = (app) => {

  /* GET home page. */
  // app.get('/', (req, res) => {
  //   Pet.find().exec((err, pets) => {
  //     res.render('pets-index', { pets: pets });    
  //   });
  // });

/* GET home page. */
// result.docs: the array of records on the current page
// result.page: the current page
//result.pages: the total number of pages
app.get('/', (req, res) => {
  const page = req.query.page || 1
  Pet.paginate({}, {page: page}).then((results) => {
    res.render('pets-index', { pets: results.docs, pagesCount: results.pages, currentPage: results.page});     
  });
});
}
