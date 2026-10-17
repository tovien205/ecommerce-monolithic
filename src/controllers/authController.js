const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

// Đăng ký tài khoản
const register = async (req, res) => {
  try {
    const { uid, username, fullname, password, roleid, mid } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        uid,
        username,
        fullname,
        password: hashedPassword,
        roleid,
        mid
      }
    });

    res.status(201).json({ 
      message: 'User registered successfully', 
      user: { uid: newUser.uid, username: newUser.username } 
    });
  } catch (error) {
    res.status(500).json({ message: 'Register failed', error: error.message });
  }
};

// Đăng nhập & Tạo JWT Token (Khớp Bước 9)
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const accessToken = jwt.sign(
      { uid: user.uid, username: user.username, roleid: user.roleid },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    res.status(200).json({
      accessToken
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

module.exports = {
  register,
  login
};