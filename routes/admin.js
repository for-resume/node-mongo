const express = require('express');
const { body } = require('express-validator/check');

const adminController = require('../controllers/admin');

const isAuth = require('../middleware/is-auth');

const router = express.Router();

// So the request which reaches get product goes into that isAuth middleware
// first and in the isAuth middleware, we might be redirecting and we don't call next,
// hence the request would never continue to that controller action
// but if we make it past the if check here in the middleware, we do call next,
// so the next middleware in line will be called and the next middleware in line
// would be our get add product controller action here.
router.get('/add-product', isAuth, adminController.getAddProduct);

router.get('/products', isAuth, adminController.getProducts);

router.post(
  '/add-product',
  [
    body('title').isString().isLength({ min: 3 }).trim(),
    body('imageUrl').isURL(),
    body('price').isFloat(),
    body('description').isLength({ min: 5, max: 400 }).trim(),
  ],
  isAuth,
  adminController.postAddProduct
);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post(
  '/edit-product',
  [
    body('title').isString().isLength({ min: 3 }).trim(),
    body('imageUrl').isURL(),
    body('price').isFloat(),
    body('description').isLength({ min: 5, max: 400 }).trim(),
  ],
  isAuth,
  adminController.postEditProduct
);

router.post('/delete-product', isAuth, adminController.postDeleteProduct);

module.exports = router;
