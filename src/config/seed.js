import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import process from "process";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function initDatabase() {
    const countRole = await prisma.role.count();
    const countUser = await prisma.user.count();
    const countEvent = await prisma.event.count();

    if (countRole === 0) {
        const roles = [
            { name: "ADMIN", description: "Quản trị hệ thống" },
            { name: "USER", description: "Người dùng bình thường" }
        ];

        for (const role of roles) {
            const existing = await prisma.role.findUnique({ where: { name: role.name } });
            if (!existing) {
                await prisma.role.create({ data: role });
            }
        }
        console.log("✅ Đã thêm roles");
    }

    if (countUser === 0) {
        const hashedPassword = await bcrypt.hash("123456", 10);
        const adminRole = await prisma.role.findUnique({ where: { name: "ADMIN" } });
        const userRole = await prisma.role.findUnique({ where: { name: "USER" } });

        const users = [
            { fullName: "Nguyễn Chí Thịnh", phone: "0912345678", email: "thinh@example.com", password: hashedPassword, birthDate: new Date("1990-01-01"), gender: "Nam", roleId: adminRole.id },
            { fullName: "Nguyễn Văn A", phone: "0987654321", email: "vana@example.com", password: hashedPassword, birthDate: new Date("1990-01-01"), gender: "Nam", roleId: userRole.id },
        ];
        for (const user of users) {
            const existingUser = await prisma.user.findUnique({
                where: { phone: user.phone },
            });
            if (!existingUser) {
                await prisma.user.create({ data: user });
            }
        }
        console.log("✅ Đã thêm users");
    }
    if (countEvent === 0) {
        const events = [
            {
                title: "Water bomb Ho Chi Minh City 2025",
                description: "Sự kiện EDM hoành tráng với dàn DJ quốc tế.",
                category: "EDM",
                location: "SVĐ Phú Thọ, Quận 11, TP.HCM",
                startDate: new Date("2025-10-19"),
                duration: "19:30 - 22:30",
                organizer: "YG Entertainment",
                bannerUrl:
                    "https://salt.tkbcdn.com/ts/ds/f3/80/f0/32ee189d7a435daf92b6a138d925381c.png",
                ticketTypes: {
                    create: [
                        { type: "Standard", price: 300000, quantity: 500, description: "Vé thường" },
                        { type: "VIP", price: 800000, quantity: 100, description: "Vé VIP" },
                    ],
                },
            },
            {
                title: `1CINÉ x CHILLIES: “KIM” THE 2ND ALBUM PRE-LISTENING PRIVATE SHOWCASE`,
                description: `
<p><strong>CINÉ x CHILLIES: “KIM” - THE 2ND ALBUM PRE-LISTENING PRIVATE SHOWCASE | 12.10.2025</strong></p>

<p>Sau 4 năm kể từ album đầu tay, Chillies chính thức trở lại với album phòng thu thứ hai mang tên “KIM”. Đặc biệt, bạn sẽ là một trong những khán giả “đầu tiên” được thưởng thức trọn vẹn những bản live đầu tiên của Album "KIM" trước khi album được phát hành, tại buổi pre-listening private showcase duy nhất diễn ra tại Ciné Saigon.</p>

<p>Một đêm diễn đặc biệt dành riêng cho những ai yêu mến âm nhạc Chillies. Sân khấu lần này không chỉ để lắng nghe những ca khúc mới, mà còn là khoảnh khắc kết nối gần gũi giữa Chillies và khán giả. Hãy chuẩn bị tinh thần cho một đêm nhạc bất ngờ và đáng nhớ cùng Chillies!</p>`,
                category: "Nhạc sống",
                location: "Nhà Văn Hóa Thanh Niên, TP.HCM",
                startDate: new Date("2025-11-01"),
                duration: "19:30 - 22:30",
                organizer: "Food Global",
                bannerUrl:
                    "https://salt.tkbcdn.com/ts/ds/63/8e/c1/6be36d3ecc5fe3e0c4a31b27a00f80fc.jpg",
                ticketTypes: {
                    create: [
                        { type: "Chilly", price: 100000, quantity: 0, description: "Vé Chilly" },
                    ],
                },
            },
            {
                title: `EM XINH "SAY HI" CONCERT - ĐÊM 2`,
                description: "Sự kiện marathon với nhiều cự ly khác nhau.",
                category: "Thể thao",
                location: "Phố đi bộ Nguyễn Huệ, TP.HCM",
                startDate: new Date("2025-12-10"),
                duration: "19:30 - 22:30",
                organizer: "City Marathon Org",
                bannerUrl:
                    "https://salt.tkbcdn.com/ts/ds/90/37/6e/cfa9510b1f648451290e0cf57b6fd548.jpg",
                ticketTypes: {
                    create: [
                        { type: "Em", price: 200000, quantity: 0, description: "Vé Em" },
                        { type: "Xinh", price: 300000, quantity: 200, description: "Vé Xinh" },
                        { type: "SayHi", price: 500000, quantity: 100, description: "Vé SayHi" },
                    ],
                },
            },
            {
                title: "DAY6 10th Anniversary Tour <The DECADE> in HO CHI MINH CITY",
                description: "Trình diễn các công nghệ mới nhất trong AI, IoT và VR.",
                category: "Nhạc sống",
                location: "Trung tâm Hội nghị SECC, Q.7, TP.HCM",
                startDate: new Date("2025-11-20"),
                duration: "19:30 - 22:30",
                organizer: "TechWorld Vietnam",
                bannerUrl:
                    "https://salt.tkbcdn.com/ts/ds/c6/e1/c2/d3d41b377ea3d9a3cd18177d656516d7.jpg",
                ticketTypes: {
                    create: [
                        { type: "General", price: 150000, quantity: 1000, description: "Vé General" },
                        { type: "VIP", price: 500000, quantity: 200, description: "Vé VIP" },
                    ],
                },
            },
            {
                title: "Italia Mistero",
                description:
                    "Lần đầu tiên tại Hà Nội, Dàn nhạc Teatro Massimo, biểu tượng nghệ thuật...",
                category: "Nhạc cổ điển",
                location: "CGV Landmark 81, TP.HCM",
                startDate: new Date("2025-12-05"),
                duration: "19:30 - 22:30",
                organizer: "Vietnam Film Association",
                bannerUrl:
                    "https://salt.tkbcdn.com/ts/ds/88/52/dd/6ad9f988be92ae9bbaf1cbd395b3aa10.jpg",
                ticketTypes: {
                    create: [
                        { type: "Standard", price: 120000, quantity: 500, description: "Vé Standard" },
                        { type: "Combo 3 phim", price: 300000, quantity: 200, description: "Vé Combo 3 phim" },
                    ],
                },
            },
            {
                title: "1900 x Vũ. - Bảo Tàng Của Nuối Tiếc Private Show",
                description: `
<p>Tròn một năm kể từ thành công của Album phòng thu thứ 3 và Concert Tour “Bảo Tàng Của Nuối Tiếc”, Vũ. sẽ kết hợp cùng 1900 Lé Théâtre để mang đến một đêm diễn đặc biệt - Private show “Bảo Tàng Của Nuối Tiếc”, như lời tri ân dành cho các khán giả. Đây cũng là lần đầu tiên Vũ. tổ chức Private show “Bảo Tàng Của Nuối Tiếc” dành riêng cho khán giả Hà Nội.</p>
<p><strong>QUY ĐỊNH CHUNG CỦA SỰ KIỆN</strong></p>
<p>Điều 1. Sự kiện chỉ dành cho đối tượng khán giả trên 18 tuổi.</p>
<p>Điều 2. Mỗi coupon chỉ dành cho một khán giả tham dự.</p>
<p>Điều 3. Coupon đã mua không được đổi hoặc hoàn trả dưới mọi hình thức...</p>
<p>Điều 4. Hãy kiểm tra kỹ thông tin trước khi đặt coupon...</p>
<p>Điều 5. Vui lòng không mua coupon từ bất kỳ nguồn nào khác ngoài Ticketbox...</p>
<p>Điều 6. Khi tham gia chương trình, khán giả đồng ý với việc hình ảnh của mình...</p>
<p>Điều 7. Không được phép quay phim/chụp hình bằng máy ảnh chuyên dụng...</p>
<p>Điều 8. Khách hàng đồng ý cho phép ban tổ chức quay phim...</p>
<p>Điều 9. Không được phép phát sóng trực tiếp (livestream) sự kiện...</p>
<p>Điều 10. BTC có quyền kiểm tra giấy tờ tùy thân...</p>
<p>Điều 11. BTC có thể hoãn, hủy hoặc tạm ngưng sự kiện...</p>
<p>Điều 12. Khán giả tham dự sự kiện phải tự ý thức...</p>
<p>Điều 13. Trong mọi trường hợp, quyết định của BTC là quyết định cuối cùng.</p>`,
                category: "Nhạc sống",
                location: "SVĐ Quân Khu 7, TP.HCM",
                startDate: new Date("2025-10-30"),
                duration: "19:30 - 22:30",
                organizer: "RapViet Entertainment",
                bannerUrl:
                    "https://salt.tkbcdn.com/ts/ds/c9/42/c9/e51cdafa1dfa1937e1847bd3ef2371af.jpg",
                ticketTypes: {
                    create: [
                        { type: "Thường", price: 250000, quantity: 1000, description: "Vé Thường" },
                        { type: "VIP", price: 700000, quantity: 200, description: "Vé VIP" },
                    ],
                },
            },
            {
                title: "Vui Hội Trăng Rằm Cùng Van Phuc WaterShow",
                description: "Học hỏi kinh nghiệm từ các startup thành công.",
                category: "Giải trí",
                location: "ĐH Kinh Tế TP.HCM",
                startDate: new Date("2025-11-10"),
                duration: "19:30 - 22:30",
                organizer: "Startup Vietnam Foundation",
                bannerUrl:
                    "https://salt.tkbcdn.com/ts/ds/9c/0e/cf/ffa9add63b449ab12f587d1a10ab5bc7.jpg",
                ticketTypes: {
                    create: [
                        { type: "Sinh viên", price: 50000, quantity: 300, description: "Vé Sinh viên" },
                        { type: "Doanh nhân", price: 200000, quantity: 100, description: "Vé Doanh nhân" },
                    ],
                },
            },
            {
                title: "SUPERFEST 2025 - Concert Mùa Hè Rực Sáng",
                description: "Các đội bóng sinh viên tranh tài hấp dẫn.",
                category: "Nhạc sống",
                location: "SVĐ Thống Nhất, TP.HCM",
                startDate: new Date("2025-11-25"),
                duration: "19:30 - 22:30",
                organizer: "Liên đoàn bóng đá SVVN",
                bannerUrl:
                    "https://salt.tkbcdn.com/ts/ds/fb/eb/66/1d976574a7ad259eb46ec5c6cfeaf63e.png",
                ticketTypes: {
                    create: [
                        { type: "Khán đài thường", price: 50000, quantity: 3000, description: "Vé Khán đài thường" },
                        { type: "Khán đài VIP", price: 150000, quantity: 500, description: "Vé Khán đài VIP" },
                    ],
                },
            },
            {
                title: "THOMAS ANDERS FROM MODERN TALKING",
                description: "Bộ sưu tập nghệ thuật độc đáo của các họa sĩ trẻ.",
                category: "Nhạc sống",
                location: "Bảo tàng Mỹ Thuật TP.HCM",
                startDate: new Date("2025-10-20"),
                duration: "19:30 - 22:30",
                organizer: "ArtSpace Vietnam",
                bannerUrl:
                    "https://salt.tkbcdn.com/ts/ds/3e/b1/c1/034602970c0ce4c58daee24779476ae5.jpg",
                ticketTypes: {
                    create: [
                        { type: "Thường", price: 70000, quantity: 500, description: "Vé Thường" },
                        { type: "VIP", price: 200000, quantity: 100, description: "Vé VIP" },
                    ],
                },
            },
            {
                title: "LULULOLA SHOW VŨ CÁT TƯỜNG | NGÀY NÀY, NGƯỜI CON GÁI NÀY",
                description:
                    "Lululola Show - Hơn cả âm nhạc, không gian lãng mạn đậm chất thơ Đà Lạt bao trọn hình ảnh thung lũng Đà Lạt, được ngắm nhìn khoảng khắc hoàng hôn thơ mộng đến khi Đà Lạt về đêm siêu lãng mạn, được giao lưu với thần tượng một cách chân thật và gần gũi nhất trong không gian ấm áp và không khí se lạnh của Đà Lạt. Tất cả sẽ mang đến một đêm nhạc ấn tượng mà bạn không thể quên khi đến với Đà Lạt.",
                category: "Nhạc sống",
                location: "Công viên 23/9, TP.HCM",
                startDate: new Date("2025-12-18"),
                duration: "19:30 - 22:30",
                organizer: "Street Culture Org",
                bannerUrl:
                    "https://salt.tkbcdn.com/ts/ds/cb/5a/3b/13e9a9ccf99d586df2a7c6bd59d89369.png",
                ticketTypes: {
                    create: [
                        { type: "Vé Ngày", price: 80000, quantity: 1000, description: "Vé Ngày" },
                        { type: "Combo 3 ngày", price: 200000, quantity: 300, description: "Vé Combo 3 ngày" },
                    ],
                },
            },
        ];

        for (const e of events) {
            const event = await prisma.event.create({ data: e });
            for (const ticketType of e.ticketTypes.create) {
                await prisma.ticketType.create({ data: { ...ticketType, eventId: event.id } });
            }
        }

        console.log("✅ Đã thêm events");
    }
    if (countRole !== 0 && countUser !== 0 && countEvent !== 0) {
        console.log("Database already seeded with users.");
    }
}

initDatabase()
    .then(() => {
        console.log("🌱 Seed hoàn tất");
    })
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

export { initDatabase }