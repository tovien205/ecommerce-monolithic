const prisma = require('../config/prisma');

// Hàm tính discount (%) dựa trên điểm membership score
const getDiscountRate = (score) => {
  if (score >= 100) return 0.15; // Giảm 15% nếu score >= 100
  if (score >= 50) return 0.10;  // Giảm 10% nếu score >= 50
  return 0.0;                    // Không giảm giá
};

const createOrder = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Danh sách sản phẩm không được trống' });
    }

    const user = await prisma.user.findUnique({
      where: { uid },
      include: { membership: true }
    });

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    const score = user.membership ? user.membership.score : 0;
    const discountRate = getDiscountRate(score);

    const result = await prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const orderDetailsData = [];

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { pid: item.pid }
        });

        if (!product) {
          throw new Error(`Sản phẩm ${item.pid} không tồn tại`);
        }

        if (product.quantity < item.qty) {
          throw new Error(`Sản phẩm ${product.pname} không đủ số lượng tồn kho (Còn lại: ${product.quantity}, Yêu cầu: ${item.qty})`);
        }

        await tx.product.update({
          where: { pid: item.pid },
          data: { quantity: product.quantity - item.qty }
        });

        const discountedUnitPrice = product.price * (1 - discountRate);
        totalAmount += discountedUnitPrice * item.qty;

        orderDetailsData.push({
          pid: item.pid,
          qty: item.qty,
          unit_price: discountedUnitPrice
        });
      }

      const oid = `ORD_${Date.now()}`;
      const newOrder = await tx.order.create({
        data: { oid, uid }
      });

      for (const detail of orderDetailsData) {
        await tx.orderDetail.create({
          data: {
            oid,
            pid: detail.pid,
            qty: detail.qty,
            unit_price: detail.unit_price
          }
        });
      }

      const shipment = await tx.shipment.create({
        data: {
          shipid: `SHIP_${Date.now()}`,
          oid,
          status: 'PENDING'
        }
      });

      return {
        order: newOrder,
        orderDetails: orderDetailsData,
        shipment,
        summary: { totalAmount }
      };
    });

    res.status(201).json({
      message: 'Tạo đơn hàng thành công',
      data: result
    });

  } catch (error) {
    res.status(400).json({ 
      message: 'Đặt hàng thất bại do kiểm tra tồn kho', 
      error: error.message 
    });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const uid = req.user.uid;
    const orders = await prisma.order.findMany({
      where: { uid },
      include: {
        orderDetails: { include: { product: true } },
        shipment: true
      }
    });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy thông tin đơn hàng', error: error.message });
  }
};

module.exports = {
  createOrder,
  getUserOrders
};