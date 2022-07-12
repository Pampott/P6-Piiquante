const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const multer = require('../middlewares/multer-config');

const sauceCtrl = require('../controllers/sauce');

router.get('/', auth, sauceCtrl.getSauces);

//router.post('/', auth, multer, sauceCtrl.createSauce);

module.exports = router;