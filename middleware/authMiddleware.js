const User = require('../models/user');
const Product = require('../models/product');
exports.isLoggedIn = (req, res, next) => {
  if (req.session.userId) {
    return next();
  }
  res.redirect('/auth/login?message=You must be signed in first!');
};

exports.isGuest = (req, res, next) => {
  if (!req.session.userId) {
    return next();
  }
  res.redirect('/');
};


exports.isSeller = async (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/auth/login?message=Please login to continue.');
  }
  try {
    const user = await User.findById(req.session.userId);
    if (user && (user.role === 'seller' || user.role === 'admin') && !user.isBanned) {
      return next();
    }
    res.status(403).render('403', { title: 'Forbidden - Seller Access Required' });
  } catch (error) {
    console.error("Error in isSeller middleware:", error);
    res.status(500).render('500', { title: 'Server Error' });
  }
};

exports.isAdmin = async (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/auth/login?message=Please login to continue.');
  }
  try {
    const user = await User.findById(req.session.userId);
    if (user && user.role === 'admin' && !user.isBanned) {
      return next();
    }
    res.status(403).render('403', { title: 'Forbidden - Admin Access Required' });
  } catch (error) {
    console.error("Error in isAdmin middleware:", error);
    res.status(500).render('500', { title: 'Server Error' });
  }
};

exports.isOwnerOrAdmin = async (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/auth/login?message=Please login to continue.');
    }
    try {
        const user = await User.findById(req.session.userId);
        if (!user || user.isBanned) {
            req.session.destroy();
            return res.redirect('/auth/login?message=Your account is inactive or banned.');
        }

        if (user.role === 'admin') {
            return next(); 
        }
        
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).render('404', { title: 'Product Not Found' });
        }

        if (product.seller.toString() === req.session.userId) {
            return next();
        }
        
        res.status(403).render('403', { title: 'Forbidden - Not Your Product' });

    } catch (error) {
        console.error("Error in isOwnerOrAdmin middleware:", error);
        if (error.kind === 'ObjectId') {
             return res.status(404).render('404', { title: 'Invalid ID format' });
        }
        res.status(500).render('500', { title: 'Server Error' });
    }
};


exports.isNotBanned = async (req, res, next) => {
  if (req.session.userId) {
    try {
      const user = await User.findById(req.session.userId);
      if (user && user.isBanned) {
        req.session.destroy((err) => {
          if (err) console.error("Session destroy error:", err);
          return res.redirect('/auth/login?message=Your account has been banned.');
        });
        return; 
      }
    } catch (error) {
      console.error("Error in isNotBanned middleware:", error);
    }
  }
  next();
};