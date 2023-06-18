const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

// @desc Registration
// @route POST /Registration
// @access Public
const registration = async (req, res) => {
  console.log(req.body);
  const { username, password, repeatedPassword } = req.body;
  if (!username || !password || !repeatedPassword)
    return res.status(400).json({ message: "All fields are required" });

  if (!(password === repeatedPassword))
    res.status(400).json({ message: "Passwords are not matches" });

  const duplicate = await User.findOne({ username }).lean().exec();
  if (duplicate)
    return res
      .status(409)
      .json({ message: "User with this name already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    username,
    password: hashedPassword,
  });

  const foundUser = await User.findOne({ username }).lean().exec();
  console.log(foundUser);

  if (foundUser) {
    const accessToken = jwt.sign(
      {
        userInfo: {
          username: foundUser.username,
          roles: foundUser.roles,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { username: foundUser.username },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSits: "None",
      maxAge: 24 * 7 * 60 * 60 * 1000,
    });
    
    const user = {
      accessToken,
      id: foundUser._id,
      username: foundUser.username,
      active: foundUser.active,
      roles: foundUser.roles
    }

    res.json(user);
  } else {
    res.status(400).json({ meassage: "Invalid user data recieved" });
  }
};

// @desc Login
// @route POST /auth
// @access Public
const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    res.status(400).json({ message: "All fileds are required" });

  const foundUser = await User.findOne({ username }).exec();

  if (!foundUser || !foundUser.active)
    return res.status(401).json({ message: "Unauthorized" });

  const matchPassword = await bcrypt.compare(password, foundUser.password);

  if (!matchPassword) return res.status(401).json({ message: "Unauthorized" });

  const accessToken = jwt.sign(
    {
      userInfo: {
        username: foundUser.username,
        roles: foundUser.roles,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );
  const refreshToken = jwt.sign(
    { username: foundUser.username },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "1d" }
  );

  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    username: foundUser.username,
    id: foundUser._id,
    active: foundUser.active,
    roles: foundUser.roles,
    accessToken,
  });
});

// @desc Refresh
// @route GET /auth/Refresh
// @access Public
const refresh = (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.status(401).json({ message: "Unauthorized" });
  const refreshToken = cookies.jwt;

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    asyncHandler(async (err, decoded) => {
      if (err) return res.status(403).json({ message: "Forbidden" });
      const foundUser = await User.findOne({
        username: decoded.username,
      }).exec();
      if (!foundUser) return res.status(401).json({ message: "Unauthorized" });

      const accessToken = jwt.sign(
        {
          userInfo: {
            username: foundUser.username,
            roles: foundUser.roles,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "10s" }
      );

      res.json({ accessToken });
    })
  );
};

// @desc Logout
// @route POST /auth/logout
// @access Public
const logout = (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.status(204);
  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "None",
    secure: true,
  });
  res.json({ message: "Cookie cleared" });
};

module.exports = {
  login,
  refresh,
  logout,
  registration,
};
