const express = require('express');
const router = express.Router();
const shipmentController = require('../controllers/shipmentController');
const { authenticateToken } = require('../middleware/authMiddleware'); // Destructuring lấy đúng hàm authenticateToken

// Route cập nhật trạng thái Shipment (yêu cầu token)
router.patch('/:shipid/status', authenticateToken, shipmentController.updateShipmentStatus);

// Route lấy Shipment theo Order ID (yêu cầu token)
router.get('/order/:oid', authenticateToken, shipmentController.getShipmentByOrder);

module.exports = router;