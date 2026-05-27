import axios from "axios";
import crypto from "crypto";

/**
 * Tạo URL thanh toán MoMo
 * @param {Object} params - Thông tin thanh toán
 * @param {number} params.amount - Số tiền (VND)
 * @param {string} params.orderId - ID đơn hàng
 * @param {string} params.orderInfo - Thông tin đơn hàng
 * @param {string} params.returnUrl - URL redirect sau khi thanh toán xong
 * @returns {Promise<string>} Payment URL (payUrl từ MoMo)
 */
export const createMoMoPaymentUrl = async (params) => {
    const { amount, orderId, orderInfo, returnUrl } = params;
    const MOMO_PARTNER_CODE = process.env.MOMO_PARTNER_CODE;
    const MOMO_ACCESS_KEY = process.env.MOMO_ACCESS_KEY;
    const MOMO_SECRET_KEY = process.env.MOMO_SECRET_KEY;
    const MOMO_ENDPOINT = process.env.MOMO_ENDPOINT;

    const requestId = `MOMO_${orderId}_${Date.now()}`;
    const momoOrderId = requestId;
    const ipnUrl = `${process.env.BACKEND_URL}/api/carts/momo-ipn`;
    const requestType = "payWithMethod";
    const extraData = "";
    const finalOrderInfo = orderInfo || `Thanh toán đơn hàng #${orderId}`;

    // Chuỗi mã hóa signature
    const rawSignature = `accessKey=${MOMO_ACCESS_KEY}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${momoOrderId}&orderInfo=${finalOrderInfo}&partnerCode=${MOMO_PARTNER_CODE}&redirectUrl=${returnUrl}&requestId=${requestId}&requestType=${requestType}`;

    const signature = crypto
        .createHmac("sha256", MOMO_SECRET_KEY)
        .update(rawSignature)
        .digest("hex");

    const requestBody = {
        partnerCode: MOMO_PARTNER_CODE,
        accessKey: MOMO_ACCESS_KEY,
        requestId: requestId,
        amount: String(amount),
        orderId: momoOrderId,
        orderInfo: finalOrderInfo,
        redirectUrl: returnUrl,
        ipnUrl: ipnUrl,
        extraData: extraData,
        requestType: requestType,
        signature: signature,
        lang: "vi",
    };

    try {
        const response = await axios.post(MOMO_ENDPOINT, requestBody, {
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (response.data && response.data.payUrl) {
            return response.data.payUrl;
        } else {
            throw new Error(response.data.message || "Lỗi tạo giao dịch MoMo");
        }
    } catch (error) {
        console.error("MoMo create payment error:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Verify redirect hoặc IPN từ MoMo (Chữ ký SHA256)
 * @param {Object} data - Dữ liệu nhận được từ MoMo (query hoặc body)
 * @returns {Object} Kết quả verify
 */
export const verifyMoMoSignature = (data) => {
    try {
        const MOMO_ACCESS_KEY = process.env.MOMO_ACCESS_KEY;
        const MOMO_SECRET_KEY = process.env.MOMO_SECRET_KEY;
        const partnerCode = data.partnerCode || "";
        const orderId = data.orderId || "";
        const requestId = data.requestId || "";
        const amount = data.amount || "";
        const orderInfo = data.orderInfo || "";
        const transId = data.transId || "";
        const resultCode = data.resultCode !== undefined && data.resultCode !== null ? String(data.resultCode) : "";
        const message = data.message || "";
        const responseTime = data.responseTime || "";
        const extraData = data.extraData || "";
        const signature = data.signature || "";

        if (!orderId || !signature) {
            return {
                isVerified: false,
                isSuccess: false,
                transactionRef: null,
                message: "Thiếu thông tin xác thực",
            };
        }

        // Chuỗi mã hóa signature trả về
        const rawSignature = `accessKey=${MOMO_ACCESS_KEY}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

        const computedSignature = crypto
            .createHmac("sha256", MOMO_SECRET_KEY)
            .update(rawSignature)
            .digest("hex");

        const isVerified = computedSignature === signature;
        const isSuccess = isVerified && Number(resultCode) === 0;

        // Trích xuất orderId gốc của hệ thống từ orderId của MoMo (MOMO_orderId_timestamp)
        const parts = orderId.split("_");
        const originalOrderId = parts.length > 1 ? Number(parts[1]) : null;

        return {
            isVerified,
            isSuccess,
            transactionRef: transId,
            orderId: originalOrderId,
            message: isSuccess ? "Thanh toán thành công" : message || "Thanh toán thất bại",
        };
    } catch (error) {
        console.error("MoMo signature verification error:", error);
        return {
            isVerified: false,
            isSuccess: false,
            transactionRef: data.transId || null,
            message: error.message,
        };
    }
};
