import CryptoJS from "crypto-js";
import axios from "axios";

/**
 * Tạo URL thanh toán ZaloPay
 * @param {Object} params - Thông tin thanh toán
 * @param {number} params.amount - Số tiền (VND)
 * @param {string} params.orderId - ID đơn hàng
 * @param {string} params.orderInfo - Thông tin đơn hàng
 * @param {string} params.returnUrl - URL callback/redirect sau khi thanh toán
 * @returns {Promise<string>} Payment URL (order_url từ ZaloPay)
 */
export const createZaloPayPaymentUrl = async (params) => {
    const { amount, orderId, orderInfo, returnUrl } = params;
    const ZALOPAY_APP_ID = process.env.ZALOPAY_APP_ID;
    const ZALOPAY_KEY1 = process.env.ZALOPAY_KEY1;
    const ZALOPAY_ENDPOINT = process.env.ZALOPAY_ENDPOINT;
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const appTransId = `${yy}${mm}${dd}_${orderId}_${Date.now()}`;

    const embedData = {
        redirecturl: returnUrl
    };

    const items = [];

    const orderData = {
        app_id: Number(ZALOPAY_APP_ID),
        app_trans_id: appTransId,
        app_user: "TicketGoUser",
        app_time: Date.now(),
        amount: Number(amount),
        item: JSON.stringify(items),
        embed_data: JSON.stringify(embedData),
        description: orderInfo || `Thanh toán đơn hàng #${orderId}`,
        bank_code: "",
        callback_url: `${process.env.BACKEND_URL}/api/carts/zalopay-ipn`,
    };

    // Chuỗi mã hóa mac: app_id|app_trans_id|app_user|amount|app_time|embed_data|item
    const dataStr = `${orderData.app_id}|${orderData.app_trans_id}|${orderData.app_user}|${orderData.amount}|${orderData.app_time}|${orderData.embed_data}|${orderData.item}`;
    orderData.mac = CryptoJS.HmacSHA256(dataStr, ZALOPAY_KEY1).toString();

    try {
        const response = await axios.post(ZALOPAY_ENDPOINT, orderData);
        if (response.data && response.data.return_code === 1) {
            return response.data.order_url;
        } else {
            throw new Error(response.data.return_message || "Lỗi tạo giao dịch ZaloPay");
        }
    } catch (error) {
        console.error("ZaloPay create payment error:", error);
        throw error;
    }
};

/**
 * Verify redirect từ ZaloPay (GET)
 * @param {Object} query - Query parameters từ redirect URL
 * @returns {Object} Kết quả verify
 */
export const verifyZaloPayRedirect = (query) => {
    try {
        const ZALOPAY_KEY2 = process.env.ZALOPAY_KEY2;
        const { appid, apptransid, pmcid, bankcode, amount, discountamount, status, checksum } = query;

        if (!apptransid || !checksum) {
            return {
                isVerified: false,
                isSuccess: false,
                transactionRef: null,
                message: "Thiếu thông tin xác thực",
            };
        }

        // Chuỗi mã hóa: appid|apptransid|pmcid|bankcode|amount|discountamount|status
        const dataStr = `${appid}|${apptransid}|${pmcid}|${bankcode}|${amount}|${discountamount}|${status}`;
        const computedMac = CryptoJS.HmacSHA256(dataStr, ZALOPAY_KEY2).toString();

        const isVerified = computedMac === checksum;
        const isSuccess = isVerified && Number(status) === 1;

        // Trích xuất orderId từ apptransid (yyMMdd_orderId_timestamp)
        const parts = apptransid.split("_");
        const orderId = parts.length > 1 ? parts[1] : null;

        return {
            isVerified,
            isSuccess,
            transactionRef: apptransid,
            orderId,
            message: isSuccess ? "Thanh toán thành công" : "Thanh toán không thành công",
        };
    } catch (error) {
        console.error("ZaloPay redirect verification error:", error);
        return {
            isVerified: false,
            isSuccess: false,
            transactionRef: query.apptransid || null,
            message: error.message,
        };
    }
};

/**
 * Verify POST callback từ ZaloPay (IPN)
 * @param {Object} body - Request body từ ZaloPay callback (chứa { data, mac })
 * @returns {Object} Kết quả verify và thông tin đơn hàng
 */
export const verifyZaloPayCallback = (body) => {
    try {
        const ZALOPAY_KEY2 = process.env.ZALOPAY_KEY2;
        const { data, mac } = body;

        if (!data || !mac) {
            return {
                isVerified: false,
                message: "Thiếu dữ liệu hoặc chữ ký mac",
            };
        }

        // Tính HMAC-SHA256 của data bằng KEY2
        const computedMac = CryptoJS.HmacSHA256(data, ZALOPAY_KEY2).toString();
        const isVerified = computedMac === mac;

        if (!isVerified) {
            return {
                isVerified: false,
                message: "Chữ ký mac không khớp",
            };
        }

        const parsedData = JSON.parse(data);
        const appTransId = parsedData.app_trans_id;
        const zpTransId = parsedData.zp_trans_id;

        // Trích xuất orderId từ app_trans_id (yyMMdd_orderId_timestamp)
        const parts = appTransId.split("_");
        const orderId = parts.length > 1 ? parts[1] : null;

        return {
            isVerified: true,
            orderId,
            zpTransId,
            appTransId,
            message: "Xác thực callback thành công",
        };
    } catch (error) {
        console.error("ZaloPay callback verification error:", error);
        return {
            isVerified: false,
            message: error.message,
        };
    }
};
