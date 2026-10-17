const prisma = require('../config/prisma');

const VALID_STATUSES = ['PENDING', 'SHIPPING', 'DELIVERED'];

// 1. Cập nhật trạng thái Shipment (PENDING -> SHIPPING -> DELIVERED)
const updateShipmentStatus = async (req, res) => {
  try {
    const { shipid } = req.params;
    const { status } = req.body;

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        message: 'Trạng thái không hợp lệ. Chỉ chấp nhận: PENDING, SHIPPING, DELIVERED'
      });
    }

    const existingShipment = await prisma.shipment.findUnique({
      where: { shipid }
    });

    if (!existingShipment) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin vận chuyển' });
    }

    const updatedShipment = await prisma.shipment.update({
      where: { shipid },
      data: { status }
    });

    res.status(200).json({
      message: 'Cập nhật trạng thái vận chuyển thành công',
      shipment: updatedShipment
    });
  } catch (error) {
    res.status(500).json({
      message: 'Lỗi khi cập nhật trạng thái vận chuyển',
      error: error.message
    });
  }
};

// 2. Lấy thông tin Shipment theo Order ID (oid)
const getShipmentByOrder = async (req, res) => {
  try {
    const { oid } = req.params;

    const shipment = await prisma.shipment.findFirst({
      where: { oid }
    });

    if (!shipment) {
      return res.status(404).json({ message: 'Không tìm thấy vận chuyển cho đơn hàng này' });
    }

    res.status(200).json(shipment);
  } catch (error) {
    res.status(500).json({
      message: 'Lỗi khi lấy thông tin vận chuyển',
      error: error.message
    });
  }
};

module.exports = {
  updateShipmentStatus,
  getShipmentByOrder
};