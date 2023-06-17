const express = require("express");
const router = express.Router();
const authController = require('../controllers/auth-controller')
const loginLimiter = require('../middleware/login-limiter')

router.route("/").post(loginLimiter, authController.login);
router.route('/registration').post(authController.registration)
router.route("/refresh").get(authController.refresh);
router.route("/logout").post(authController.logout);

module.exports = router;
