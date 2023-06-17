const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users-controller");
const verifyJwt = require('../middleware/verify-jwt')

// router.use(verifyJwt)

router.route("/").get(usersController.getAllUsers).post(usersController.createNewUser).patch(usersController.updateUser).delete(usersController.deleteUser);

module.exports = router;
