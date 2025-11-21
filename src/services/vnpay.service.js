import { VNPay, ignoreLogger } from 'vnpay';
import process from 'process';

const vnpay = new VNPay({
    tmnCode: process.env.VNPAY_TMN_CODE,
    secureSecret: process.env.VNPAY_HASH_SECRET,
    vnpayHost: process.env.VNPAY_URL,

    testMode: process.env.VNPAY_TEST_MODE === 'true' || true, // Chế độ test
    hashAlgorithm: 'SHA512', // Thuật toán mã hóa
    enableLog: true, // Bật/tắt log
    loggerFn: ignoreLogger,
});

/**
 * Tạo URL thanh toán VNPAY
 * @param {Object} params - Thông tin thanh toán
 * @param {number} params.amount - Số tiền (VND)
 * @param {string} params.orderId - ID đơn hàng
 * @param {string} params.orderInfo - Thông tin đơn hàng
 * @param {string} params.ipAddr - IP address của client
 * @param {string} params.returnUrl - URL callback sau khi thanh toán
 * @returns {string} Payment URL
 */
export const createPaymentUrl = (params) => {
    const { amount, orderId, orderInfo, ipAddr, returnUrl } = params;

    const paymentUrl = vnpay.buildPaymentUrl({
        vnp_Amount: amount,
        vnp_Command: 'pay',
        vnp_CreateDate: new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + '00', // Format: yyyyMMddHHmmss
        vnp_CurrCode: 'VND',
        vnp_IpAddr: ipAddr,
        vnp_Locale: 'vn',
        vnp_OrderInfo: orderInfo,
        vnp_OrderType: 'other',
        vnp_ReturnUrl: returnUrl,
        vnp_TxnRef: orderId.toString(),
        vnp_Version: '2.1.0',
    });

    return paymentUrl;
};

/**
 * Verify callback từ VNPAY
 * @param {Object} query - Query parameters từ VNPAY callback
 * @returns {Object} Kết quả verify
 */
export const verifyReturnUrl = (query) => {
    try {
        const result = vnpay.verifyReturnUrl(query);

        // VNPAY trả về transactionRef có thể là vnp_TxnRef
        const transactionRef = result.transactionRef || result.vnp_TxnRef || query.vnp_TxnRef;

        // Kiểm tra response code: 00 = thành công
        const isSuccess = result.isSuccess || result.responseCode === '00' || query.vnp_ResponseCode === '00';

        // Xác định message dựa trên response code
        const responseCode = result.responseCode || query.vnp_ResponseCode;
        let message = result.message;
        if (!message) {
            message = responseCode === '00' ? 'Thanh toán thành công' : 'Thanh toán thất bại';
        }

        return {
            isVerified: result.isVerified !== false,
            isSuccess: isSuccess,
            transactionRef: transactionRef,
            amount: result.amount || query.vnp_Amount,
            orderInfo: result.orderInfo || query.vnp_OrderInfo,
            responseCode: responseCode,
            message: message,
        };
    } catch (error) {
        console.error('VNPAY verify error:', error);
        return {
            isVerified: false,
            isSuccess: false,
            transactionRef: query.vnp_TxnRef || null,
            message: error.message,
        };
    }
};

export { vnpay };
export default vnpay;
