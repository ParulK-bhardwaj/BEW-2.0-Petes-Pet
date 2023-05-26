// MODELS
const Pet = require('../models/pet');

// PET ROUTES
module.exports = (app) => {

  // INDEX PET => index.js

  // Simple Search means doing a Fuzzy Keyword Lookup on one parameter using Regular Expressions. 
  // We are using the i modifier on a new Regular Expression to do case-insensitive matching
  // SEARCH PET
  app.get('/search', (req, res) => {
    const term = new RegExp(req.query.term, 'i')
    const page = req.query.page || 1
    Pet.paginate(
      {
        $or: [
          { 'name': term },
          { 'species': term }
        ]
      },
      { page: page }).then((results) => {
        // Why are we passing the original term and not our RegExp? 
        // Because we need the view to populate the correct URL, and it needs a string to do that!
        res.render('pets-index', { pets: results.docs, pagesCount: results.pages, currentPage: results.page, term: req.query.term });
      });
  });

  // NEW PET
  app.get('/pets/new', (req, res) => {
    res.render('pets-new');
  });

  // CREATE PET
  app.post('/pets', (req, res) => {
    let pet = new Pet(req.body);
    pet.save()
      .then((pet) => {
        res.send({ pet: pet });
      })
      .catch((err) => {
        // STATUS OF 400 FOR VALIDATIONS
        res.status(400).send(err.errors);
      }) ;
  });

  // SHOW PET
  app.get('/pets/:id', (req, res) => {
    Pet.findById(req.params.id).exec((err, pet) => {
      res.render('pets-show', { pet: pet });
    });
  });

  // EDIT PET
  app.get('/pets/:id/edit', (req, res) => {
    Pet.findById(req.params.id).exec((err, pet) => {
      res.render('pets-edit', { pet: pet });
    });
  });

  // UPDATE PET
  app.put('/pets/:id', (req, res) => {
    Pet.findByIdAndUpdate(req.params.id, req.body)
      .then((pet) => {
        res.redirect(`/pets/${pet._id}`)
      })
      .catch((err) => {
        // Handle Errors
      });
  });

  // DELETE PET
  app.delete('/pets/:id', (req, res) => {
    Pet.findByIdAndRemove(req.params.id).exec((err, pet) => {
      return res.redirect('/')
    });
  });

  // PURCHASE
  app.post('/pets/:id/purchase', (req, res) => {
    console.log(req.body);
    // Set your secret key: remember to change this to your live secret key in production
    // See your keys here: https://dashboard.stripe.com/account/apikeys
    var stripe = require("stripe")(process.env.PRIVATE_STRIPE_API_KEY);

    // Token is created using Checkout or Elements!
    // Get the payment token ID submitted by the form:
    const token = req.body.stripeToken; // Using Express

    // req.body.petId can become null through seeding,
    // this way we'll insure we use a non-null value
    let petId = req.body.petId || req.params.id;

    Pet.findById(petId).exec((err, pet)=> {
      if (err) {
        console.log('Error: ' + err);
        res.redirect(`/pets/${req.params.id}`);
      }
      const charge = stripe.charges.create({
        amount: pet.price * 100,
        currency: 'usd',
        description: `Purchased ${pet.name}, ${pet.species}`,
        source: token,
      }).then((chg) => {
        res.redirect(`/pets/${req.params.id}`);
      })
      .catch(err => {
        console.log('Error:' + err);
      });
    })

  });
}
