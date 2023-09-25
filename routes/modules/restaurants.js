const express = require('express');
const router = express.Router();
const Restaurant = require('../../models/restaurant');

// Route for creating a new restaurant (GET)
router.get('/new', (req, res) => {
  return res.render('new');
});

// Route for handling the form submission to create a new restaurant (POST)
router.post('/', (req, res) => {
  const userId = req.user._id;
  req.body.userId = userId;

  // Handling error messages during the restaurant creation process
  const {
    name,
    name_en,
    category,
    image,
    location,
    phone,
    google_map,
    rating,
    description,
  } = req.body;
  const new_error = {};

  // Validate the required fields
  if (
    !name ||
    !category ||
    !image ||
    !location ||
    !phone ||
    !google_map ||
    !rating ||
    !description
  ) {
    new_error.message = 'Please complete all required fields!';
  }

  if (Object.keys(new_error).length) {
    return res.render('new', {
      new_error,
      name,
      name_en,
      category,
      image,
      location,
      phone,
      google_map,
      rating,
      description,
    });
  }

  // Create a new restaurant in the database
  return Restaurant.create(req.body)
    .then(() => res.redirect('/'))
    .catch((error) => console.log(error));
});

// Route for viewing a specific restaurant's details (GET)
router.get('/:id', (req, res) => {
  const userId = req.user._id;
  const _id = req.params.id;

  // Find the specific restaurant with the given ID and user ID
  return Restaurant.findOne({ _id, userId })
    .lean()
    .then((restaurant) => res.render('detail', { restaurant }))
    .catch((error) => console.log(error));
});

// Route for editing a specific restaurant (GET)
router.get('/:id/edit', (req, res) => {
  const userId = req.user._id;
  const _id = req.params.id;

  // Find the specific restaurant with the given ID and user ID for editing
  return Restaurant.findOne({ _id, userId })
    .lean()
    .then((restaurant) => res.render('edit', { restaurant }))
    .catch((error) => console.log(error));
});

// Route for updating a specific restaurant's details (PUT)
router.put('/:id', (req, res) => {
  const userId = req.user._id;
  const _id = req.params.id;

  // Update the specific restaurant with the given ID and user ID in the database
  return Restaurant.updateOne({ _id, userId }, req.body)
    .then(() => res.redirect(`/restaurants/${_id}`))
    .catch((error) => console.log(error));
});

// Route for deleting a specific restaurant (DELETE)
router.delete('/:id', (req, res) => {
  const userId = req.user._id;
  const _id = req.params.id;

  // Find and remove the specific restaurant with the given ID and user ID from the database
  return Restaurant.findOne({ _id, userId })
    .then((restaurant) => restaurant.remove())
    .then(() => res.redirect('/'))
    .catch((error) => console.log(error));
});

module.exports = router;
