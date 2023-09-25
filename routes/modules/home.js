const express = require('express');
const router = express.Router();
const Restaurant = require('../../models/restaurant');

router.get('/', (req, res) => {
  const userId = req.user._id;
  Restaurant.find({ userId })
    .lean()
    .sort({ _id: 'asc' })
    .then((restaurants) => res.render('index', { restaurants }))
    .catch((error) => console.error(error));
});

router.get('/search', (req, res) => {
  const userId = req.user._id;
  const keyword = req.query.keyword.trim();
  if (!keyword) {
    return res.redirect('/');
  }
  return Restaurant.find({
    $or: [
      { name: { $regex: keyword, $options: 'i' } },
      { category: { $regex: keyword, $options: 'i' } },
    ],
    userId,
  })
    .lean()
    .then((restaurants) => {
      console.log('search ', restaurants);
      if (restaurants.length === 0) {
        res.render('index', {
          error: `您輸入的關鍵字：${keyword} 沒有符合條件的餐廳`,
          keyword,
        });
        return;
      }
      res.render('index', { restaurants, keyword });
    })
    .catch((error) => console.log(error));
});

module.exports = router;
