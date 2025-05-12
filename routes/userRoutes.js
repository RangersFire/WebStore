const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isLoggedIn, isSeller, isNotBanned } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const tempUploadDir = path.join(__dirname, '../temp_uploads');
const ensureTempUploadsDirExists = () => {
    if (!fs.existsSync(tempUploadDir)) {
        fs.mkdirSync(tempUploadDir, { recursive: true });
    }
};

const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    ensureTempUploadsDirExists();
    cb(null, tempUploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + req.session.userId + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const avatarFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Only image files (jpeg, jpg, png, gif, webp) are allowed for avatars!'), false);
};

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 1024 * 1024 * 3 }, // Max 3MB untuk avatar
  fileFilter: avatarFileFilter
});

router.get('/dashboard', isLoggedIn, isSeller, isNotBanned, userController.getSellerDashboard);
router.get('/my-products', isLoggedIn, isSeller, isNotBanned, userController.getMyProducts);

router.get('/profile', isLoggedIn, isNotBanned, userController.getProfilePage);
router.post('/profile', isLoggedIn, isNotBanned, userController.updateProfileDetails);
router.post('/profile/password', isLoggedIn, isNotBanned, userController.updatePassword);
router.post('/profile/avatar', 
    isLoggedIn, 
    isNotBanned, 
    (req, res, next) => { // Custom error handler untuk multer
        uploadAvatar.single('avatar')(req, res, function (err) {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.redirect(`/user/profile?type=error&message=Avatar image is too large. Max 3MB allowed.#profile-details`);
                }
                if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                    return res.redirect(`/user/profile?type=error&message=${err.field || 'Invalid file type for avatar.'}#profile-details`);
                }
                return res.redirect(`/user/profile?type=error&message=Multer error: ${err.message}#profile-details`);
            } else if (err) {
                return res.redirect(`/user/profile?type=error&message=Unknown error during avatar upload: ${err.message}#profile-details`);
            }
            next();
        });
    },
    userController.updateAvatar
);

module.exports = router;