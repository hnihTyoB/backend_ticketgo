import cron from 'node-cron';
import { expirePendingOrders } from '../services/cart.service.js';

export const startExpireOrdersTask = (minutes = 15) => {
    cron.schedule('*/5 * * * *', async () => {
        try {
            const result = await expirePendingOrders(minutes);
            if (result && result.count) {
                console.log(`Hủy bỏ ${result.count} đơn hàng đang chờ xử lý cũ hơn ${minutes} phút`);
            }
        } catch (err) {
            console.error('Task error:', err);
        }
    }, { scheduled: true });
};

export default startExpireOrdersTask;
