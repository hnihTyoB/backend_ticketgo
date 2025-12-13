import nodemailer from "nodemailer";
import process from "process";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports.
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
    },
});

const generateOrderConfirmationHTML = (order) => {
    const formatter = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0, // Loại bỏ số thập phân
    });

    // Lấy thông tin chi tiết từ đơn hàng
    const orderDetails = order.ticketOrderDetails;
    if (!orderDetails || orderDetails.length === 0) {
        return "<p>Thông tin đơn hàng không hợp lệ.</p>";
    }

    // Lấy thông tin sự kiện
    const eventInfo = orderDetails[0].ticketType.event;
    const eventTime = `${eventInfo.duration}, ${new Intl.DateTimeFormat('vi-VN', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(eventInfo.startDate))}`;

    const createdAt = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'long', timeStyle: 'medium' }).format(new Date(order.createdAt));

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const ticketViewUrl = `${frontendUrl}/my-tickets`;

    // Tạo các dòng cho từng loại vé trong đơn hàng
    const ticketRowsHTML = orderDetails.map(item => {
        const ticketLineItem = item.ticketType.type;
        const ticketPricePerUnit = item.price;
        const ticketQuantity = item.quantity;
        const totalTicketPrice = ticketPricePerUnit * ticketQuantity;
        const ticketLineDetail = `${formatter.format(ticketPricePerUnit).replace(/\s*₫/, '')} x ${ticketQuantity}`;

        return `
            <tr>
                <td style="padding:8px 0;">${ticketLineItem}</td>
                <td style="padding:8px 0; text-align:right;">${ticketLineDetail}</td>
                <td style="padding:8px 0; text-align:right; white-space:nowrap;">${formatter.format(totalTicketPrice)}</td>
            </tr>
        `;
    }).join('');

    return `
<div style="width:100%; background:#ffffff; padding:0; margin:0;">
    <div style="max-width:600px; margin:0 auto; background:#ffffff; font-family:Arial, sans-serif; box-shadow:0 0 10px rgba(0,0,0,0.1);">

        <div style="background:#333333; padding:15px 20px; color:white; display:flex; align-items:center;">
            <img src="https://salt.tkbcdn.com/ts/ds/32/dc/a2/7871f1207e8c4c2747698b5aa6d15a56.png"
                 alt="ticketbox logo" style="height:24px; filter: invert(100%);" />
            <div style="font-size:16px; font-weight:600; margin-left: auto;">🎫 Vé của tôi</div>
        </div>

        <div style="padding:20px 20px 0;">
            <h3 style="margin:0 0 15px; font-size:24px; font-weight:bold;">Thông tin vé</h3>

            <h1 style="margin:0 0 10px; font-size:24px; font-weight:bold;">
                ${eventInfo.title}
            </h1>

            <div style="margin:8px 0; font-size:16px; display:flex; align-items:center;">
                <span style="color:#2ecc71; margin-right:8px; font-size:18px;">⏰</span>
                ${eventTime}
            </div>
            <div style="margin:8px 0; font-size:16px; display:flex; align-items:flex-start;">
                <span style="color:#2ecc71; margin-right:8px; font-size:18px;">📍</span>
                <span style="line-height:1.4;">${eventInfo.location}</span>
            </div>

            <a href="${ticketViewUrl}"
               style="
                    display:block;
                    width:100%;
                    text-align:center;
                    margin-top:25px;
                    background:#2ecc71;
                    color:white;
                    padding:12px 0;
                    border-radius:6px;
                    text-decoration:none;
                    font-weight:bold;
                    font-size:18px;
               ">
                Xem vé của tôi
            </a>

            <p style="margin:20px 0 30px; font-size:14px; line-height:1.4; color:#555;">
                Vé điện tử của bạn cũng được đính kèm trong mail này.
                Vui lòng chuẩn bị sẵn vé điện tử tại nơi soát vé.
            </p>
        </div>
        
        <div style="border-bottom:1px solid #eeeeee;"></div>

        <div style="padding:20px;">
            <h3 style="margin:0 0 10px; font-size:18px; font-weight:bold;">Chi tiết đơn hàng</h3>
            
            <p style="font-size:14px; margin:0 0 5px;">
                Phương thức thanh toán: ${order.paymentMethod}
            </p>
            <p style="font-size:14px; margin:0 0 20px;">
                Ngày tạo đơn: ${createdAt}
            </p>

            <div style="background:#f9f9f9; padding:15px; border-radius:8px;">
                
                <table style="width:100%; font-size:14px; border-collapse:collapse;">
                    <thead>
                        <tr style="border-bottom: 1px solid #ddd;">
                            <th style="padding:8px 0; text-align:left; font-weight:bold;">Sản phẩm</th>
                            <th style="padding:8px 0; text-align:right; font-weight:bold;">Số lượng</th>
                            <th style="padding:8px 0; text-align:right; font-weight:bold;">Tổng</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${ticketRowsHTML}
                    </tbody>
                    <tfoot>
                        <tr style="border-top: 1px solid #ddd;">
                            <td colspan="2" style="padding-top:15px; font-weight:bold; font-size:16px;">Tổng tiền</td>
                            <td style="padding-top:15px; text-align:right; color:#2ecc71; font-weight:bold; font-size:16px;">
                                ${formatter.format(order.totalPrice)}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            
            <div style="text-align:center; margin-top:30px;">
                <p style="font-size:14px; margin-bottom:10px; font-weight:bold;">Family of Brands</p>
                <div style="display:inline-flex; align-items:center; justify-content:center; gap:16px;">
                    <div style="padding:4px 10px; border-radius:6px; background:#111827; display:inline-flex; align-items:center; justify-content:center;">
                        <img src="https://salt.tkbcdn.com/ts/ds/32/dc/a2/7871f1207e8c4c2747698b5aa6d15a56.png"
                            alt="ticketbox logo" style="height:22px; display:block;" />
                    </div>
                    <div style="padding:4px 10px; border-radius:6px; background:#ffffff; border:1px solid #e5e7eb; display:inline-flex; align-items:center; justify-content:center;">
                        <img src="https://salt.tkbcdn.com/ts/ds/e5/6d/9a/a5262401410b7057b04114ad15b93d85.png"
                            alt="VNPay logo" style="height:22px; display:block;" />
                    </div>
                </div>
            </div>

        </div>

        <div style="text-align:center; padding:20px; background:#111827; font-size:12px; color:#e5e7eb;">
            <div style="margin-bottom:10px; font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#9ca3af;">
                Kết nối với TicketGo
            </div>

            <div style="margin-bottom:16px;">
                <a href="#" style="display:inline-block; margin:0 6px; padding:6px 12px; border-radius:999px; background:#1f2937; color:#e5e7eb; text-decoration:none; font-size:12px;">
                    Facebook
                </a>
                <a href="#" style="display:inline-block; margin:0 6px; padding:6px 12px; border-radius:999px; background:#1f2937; color:#e5e7eb; text-decoration:none; font-size:12px;">
                    Instagram
                </a>
                <a href="#" style="display:inline-block; margin:0 6px; padding:6px 12px; border-radius:999px; background:#1f2937; color:#e5e7eb; text-decoration:none; font-size:12px;">
                    Website
                </a>
                <a href="#" style="display:inline-block; margin:0 6px; padding:6px 12px; border-radius:999px; background:#1f2937; color:#e5e7eb; text-decoration:none; font-size:12px;">
                    Liên hệ
                </a>
            </div>
            
            <p style="margin:0; line-height:1.6; color:#9ca3af;">
                2025 - Công ty TNHH TicketGo<br>
                Bạn nhận được email này vì đã đặt vé hoặc đăng ký tài khoản trên hệ thống TicketGo.<br>
                Nếu đây không phải là bạn, vui lòng bỏ qua email này.
            </p>
        </div>

    </div>
</div>
    `;
};

export const sendOrderConfirmationEmail = async (order) => {
    const mailOptions = {
        from: `"TicketGo" <${process.env.EMAIL_USER}>`,
        to: order.receiverEmail || order.user.email,
        subject: `[TicketGo] Xác nhận đơn hàng #${order.id} thành công`,
        html: generateOrderConfirmationHTML(order),
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Xác nhận đơn hàng email đã được gửi đến:", order.receiverEmail || order.user.email);
    } catch (error) {
        console.error("Lỗi khi gửi email xác nhận đơn hàng:", error);
        // Cân nhắc thêm cơ chế retry hoặc ghi log lỗi vào một hệ thống giám sát
    }
};