const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');

// Controllers
const errorController = require('./controllers/error');

// Models
const User = require('./models/user');

const MONGODB_URI =
  'mongodb+srv://antonywulf:rrajExX33hkzvo94@cluster0.mxc67.mongodb.net/shop';

// App init
const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions',
});

const csrfProtection = csrf();

// Setting Views (add ejs engine)
app.set('view engine', 'ejs');
app.set('views', 'views');

// Routes
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

// Add body-parser
app.use(bodyParser.urlencoded({ extended: false }));
// Do "public" folder static-served
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: 'my secret', // in production it should be long string value
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

// AFTER! initializing the session. csrfProtection will use it
// for flash as well
app.use(csrfProtection);
app.use(flash());

// (with session we use plain mongodb =>
// => losing special mongoose methods for our user)
// We need user mongoose-object => add middleware
app.use((req, res, next) => {
  // .session comes from express-session lib
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

// For /admin... use adminRoutes
app.use('/admin', adminRoutes);
// For /... use shopRoutes, authRoutes
app.use(shopRoutes);
app.use(authRoutes);

// use errorController, which renders 404-page
app.use(errorController.get404);

mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    // Run server on 3000 PORT
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
