const prisma = require('../config/prisma');

// 1. Tạo mới sản phẩm (POST /api/products)
const createProduct = async (req, res) => {
  try {
    const { pid, pname, price, quantity } = req.body;

    // Tự sinh pid nếu client không gửi (ví dụ: PROD_timestamp)
    const productPid = pid || `P${Date.now()}`;

    const newProduct = await prisma.product.create({
      data: {
        pid: productPid,
        pname,
        price: parseFloat(price),
        quantity: parseInt(quantity)
      }
    });

    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi tạo sản phẩm', error: error.message });
  }
};

// 2. Lấy danh sách toàn bộ sản phẩm (GET /api/products)
const getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách sản phẩm', error: error.message });
  }
};

// 3. Lấy chi tiết 1 sản phẩm theo pid (GET /api/products/:pid)
const getProductById = async (req, res) => {
  try {
    const { pid } = req.params;

    const product = await prisma.product.findUnique({
      where: { pid }
    });

    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy thông tin sản phẩm', error: error.message });
  }
};

// 4. Cập nhật thông tin sản phẩm theo pid (PUT /api/products/:pid)
const updateProduct = async (req, res) => {
  try {
    const { pid } = req.params;
    const { pname, price, quantity } = req.body;

    // Kiểm tra sản phẩm có tồn tại không
    const existingProduct = await prisma.product.findUnique({
      where: { pid }
    });

    if (!existingProduct) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm để cập nhật' });
    }

    const updatedProduct = await prisma.product.update({
      where: { pid },
      data: {
        ...(pname && { pname }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(quantity !== undefined && { quantity: parseInt(quantity) })
      }
    });

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật sản phẩm', error: error.message });
  }
};

// 5. Xóa sản phẩm theo pid (DELETE /api/products/:pid)
const deleteProduct = async (req, res) => {
  try {
    const { pid } = req.params;

    const existingProduct = await prisma.product.findUnique({
      where: { pid }
    });

    if (!existingProduct) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm để xóa' });
    }

    await prisma.product.delete({
      where: { pid }
    });

    res.status(200).json({ message: 'Xóa sản phẩm thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa sản phẩm', error: error.message });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
};