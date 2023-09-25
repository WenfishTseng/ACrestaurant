const bcrypt = require('bcryptjs');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const Restaurant = require('../restaurant');
const User = require('../user');
const restaurantList = require('../../restaurant.json').results;
const db = require('../../config/mongoose');

const SEED_USER = [
  {
    name: '0',
    email: 'user1@example.com',
    password: '12345678',
  },
  {
    name: '3',
    email: 'user2@example.com',
    password: '12345678',
  },
];

db.once('open', () => {
  return Promise.all(
    Array.from({ length: 2 }, (_, i) =>
      bcrypt
        .genSalt(10)
        .then((salt) => bcrypt.hash(SEED_USER[i].password, salt))
        .then((hash) =>
          User.create({
            name: SEED_USER[i].name,
            email: SEED_USER[i].email,
            password: hash,
          })
        )
        .then((user) => {
          return Promise.all(
            Array.from({ length: 3 }, (_, i) => {
              const j = Number(user.name);
              restaurantList[j + i].userId = user._id;
              return Restaurant.create(restaurantList[j + i]);
            })
          );
        })
    )
  )
    .then(() => {
      console.log('done.');
    })
    .catch(console.error)
    .finally(() => {
      process.exit();
    });
});
