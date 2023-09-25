const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const User = require('../../models/user');
const { log } = require('handlebars');

// User login route (GET)
router.get('/login', (req, res) => {
  res.render('login');
});
// Validate user login request (POST)
router.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true,
  })
);
// User registration route (GET)
router.get('/register', (req, res) => {
  res.render('register');
});

// Register user information (POST)
router.post(
  '/register',
  [
    // 驗證 Email 的格式
    // 驗證失敗的客製化訊息
    check('email').isEmail().trim().withMessage('請輸入正確信箱'),
    // 驗證密碼欄位
    check('password')
      .trim()
      // 長度至少五位
      .isLength({ min: 5 })
      .withMessage('長度至少五位'),
    // 驗證確認密碼欄位
    check('confirmPassword')
      .trim()
      // 加入客製化驗證函式，並保留請求 req 做後續使用
      .custom((value, { req }) => {
        // 確認密碼欄位的值需要和密碼欄位的值相符
        if (value !== req.body.password) {
          // 驗證失敗時的錯誤訊息
          throw new Error('兩次輸入的密碼不相同');
        }
        // 成功驗證回傳 true
        return true;
      }),
  ],
  (req, res) => {
    const { name, email, password, confirmPassword } = req.body;
    const errors = validationResult(req);
    // console.log('validationResult ', errors);

    // 如果有錯誤訊息＝驗證失敗
    if (!errors.isEmpty()) {
      // 顯示驗證失敗的代號 422，渲染註冊頁面、錯誤訊息，並保留原本的使用者輸入
      const errorMessages = errors.array();
      return res.status(422).render('register', {
        name,
        email,
        password,
        confirmPassword,
        errorMessages,
      });
    }

    User.findOne({ email })
      .then((user) => {
        if (user) {
          errors.push({ message: '這個 Email 已經註冊過了。' });
          res.render('register', {
            errors,
            name,
            email,
            password,
            confirmPassword,
          });
        }
        // If the user is not registered, create a new user in the database
        return bcrypt
          .genSalt(10)
          .then((salt) => bcrypt.hash(password, salt))
          .then((hash) =>
            User.create({
              name,
              email,
              password: hash,
            })
          )
          .then(() => res.redirect('/'))
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  }
);

router.get('/logout', (req, res) => {
  req.logout(function (err) {
    if (err) {
      console.log(err);
      return;
    }
    req.flash('success_msg', '你已經成功登出。');
    res.redirect('/users/login');
  });
});

module.exports = router;
