const prisma = require('../config/prisma');

// 1. Lấy thông tin cá nhân của User kèm Membership & Score (Bước 11)
const getUserProfile = async (req, res) => {
  try {
    // Lấy uid từ Token đã giải mã qua authMiddleware
    const uid = req.user.uid;

    const user = await prisma.user.findUnique({
      where: { uid },
      select: {
        uid: true,
        username: true,
        fullname: true,
        roleid: true,
        mid: true,
        role: {
          select: { rolename: true }
        },
        membership: {
          select: {
            mid: true,
            mname: true,
            score: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin người dùng' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy thông tin người dùng', error: error.message });
  }
};

// 2. Lấy danh sách toàn bộ Users (tùy chọn cho Admin)
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        uid: true,
        username: true,
        fullname: true,
        roleid: true,
        mid: true,
        membership: true
      }
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách người dùng', error: error.message });
  }
};

module.exports = {
  getUserProfile,
  getAllUsers
};