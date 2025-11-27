import cron from 'node-cron';
import { expireInactiveCarts } from '../services/cart.service.js';

export const startExpireCartsTask = (minutes = 15) => {
    // Chạy tác vụ mỗi 5 phút
    cron.schedule('*/5 * * * *', async () => {
        try {
            const result = await expireInactiveCarts(minutes);
            if (result && result.count > 0) {
                console.log(`Đã xóa ${result.count} giỏ hàng không hoạt động quá ${minutes} phút.`);
            }
        } catch (err) {
            console.error('Lỗi khi chạy tác vụ xóa giỏ hàng cũ:', err);
        }
    }, { scheduled: true });
};