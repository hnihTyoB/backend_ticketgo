import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import process from "process";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
    const countRole = await prisma.role.count();
    const countUser = await prisma.user.count();
    const countProduct = await prisma.product.count();

    if (countRole === 0) {
        await prisma.role.createMany({
            data: [
                { name: "ADMIN", description: "Admin with full access" },
                { name: "USER", description: "User with limited access" },
            ],
        });
        console.log("✅ Đã thêm roles");
    }

    if (countUser === 0) {
        const hashedPassword = await bcrypt.hash("123456", 10);
        const adminRole = await prisma.role.findFirst({ where: { name: "ADMIN" } });

        await prisma.user.createMany({
            data: [
                {
                    fullName: "John Doe",
                    username: "admin@gmail.com",
                    address: "123 Main St",
                    phone: "1234567890",
                    password: hashedPassword,
                    accountType: "SYSTEM",
                    roleId: adminRole.id,
                },
                {
                    fullName: "Jane Smith",
                    username: "user@gmail.com",
                    address: "456 Elm St",
                    phone: "9876543210",
                    password: hashedPassword,
                    accountType: "SYSTEM",
                    roleId: adminRole.id,
                },
            ],
        });
        console.log("✅ Đã thêm users");
    }
    if (countProduct === 0) {
        const products = [
            {
                name: "Laptop Asus TUF Gaming",
                price: 17490000,
                detailDesc: "ASUS TUF Gaming F15 FX506HF HN017W là chiếc laptop gaming giá rẻ nhưng vô cùng mạnh mẽ. Không chỉ bộ vi xử lý Intel thế hệ thứ 11, card đồ họa RTX 20 series mà điểm mạnh còn đến từ việc trang bị sẵn 16GB RAM, cho bạn hiệu năng xuất sắc mà không cần nâng cấp máy.",
                shortDesc: " Intel, Core i5, 11400H",
                quantity: 100,
                factory: "ASUS",
                target: "GAMING",
                image: "1711078092373-asus-01.png"
            },
            {
                name: "Laptop Dell Inspiron 15",
                price: 15490000,
                detailDesc: "Khám phá sức mạnh tối ưu từ Dell Inspiron 15 N3520, chiếc laptop có cấu hình cực mạnh với bộ vi xử lý Intel Core i5 1235U thế hệ mới và dung lượng RAM lên tới 16GB. Bạn có thể thoải mái xử lý nhiều tác vụ, nâng cao năng suất trong công việc mà không gặp bất kỳ trở ngại nào.",
                shortDesc: "i5 1235U/16GB/512GB/15.6\"FHD",
                quantity: 200,
                factory: "DELL",
                target: "SINHVIEN-VANPHONG",
                image: "1711078452562-dell-01.png"
            },
            {
                name: "Lenovo IdeaPad Gaming 3",
                price: 19500000,
                detailDesc: "Mới đây, Lenovo đã tung ra thị trường một sản phẩm gaming thế hệ mới với hiệu năng mạnh mẽ, thiết kế tối giản, lịch lãm phù hợp cho những game thủ thích sự đơn giản. Tản nhiệt mát mẻ với hệ thống quạt kép kiểm soát được nhiệt độ máy luôn mát mẻ khi chơi game.",
                shortDesc: " i5-10300H, RAM 8G",
                quantity: 150,
                factory: "LENOVO",
                target: "GAMING",
                image: "1711079073759-lenovo-01.png"
            },
            {
                name: "Asus K501UX",
                price: 11900000,
                detailDesc: "Tận hưởng cảm giác mát lạnh sành điệu với thiết kế kim loại. Được thiết kế để đáp ứng những nhu cầu điện toán hàng ngày của bạn, dòng máy tính xách tay ASUS K Series sở hữu thiết kế tối giản, gọn nhẹ và cực mỏng với một lớp vỏ họa tiết vân kim loại phong cách.",
                shortDesc: "VGA NVIDIA GTX 950M- 4G",
                quantity: 99,
                factory: "ASUS",
                target: "THIET-KE-DO-HOA",
                image: "1711079496409-asus-02.png"
            },
            {
                name: "MacBook Air 13",
                price: 17690000,
                detailDesc: "Chiếc MacBook Air có hiệu năng đột phá nhất từ trước đến nay đã xuất hiện. Bộ vi xử lý Apple M1 hoàn toàn mới đưa sức mạnh của MacBook Air M1 13 inch 2020 vượt xa khỏi mong đợi người dùng, có thể chạy được những tác vụ nặng và thời lượng pin đáng kinh ngạc.",
                shortDesc: "Apple M1 GPU 7 nhân",
                quantity: 99,
                factory: "APPLE",
                target: "GAMING",
                image: "1711079954090-apple-01.png"
            },
            {
                name: "Laptop LG Gram Style",
                price: 31490000,
                detailDesc: "14.0 Chính: inch, 2880 x 1800 Pixels, OLED, 90 Hz, OLED",
                shortDesc: "Intel Iris Plus Graphics",
                quantity: 99,
                factory: "LG",
                target: "DOANH-NHAN",
                image: "1711080386941-lg-01.png"
            },
            {
                name: "MacBook Air 13",
                price: 24990000,
                detailDesc: "Không chỉ khơi gợi cảm hứng qua việc cách tân thiết kế, MacBook Air M2 2022 còn chứa đựng nguồn sức mạnh lớn lao với chip M2 siêu mạnh, thời lượng pin chạm  ngưỡng 18 giờ, màn hình Liquid Retina tuyệt đẹp và hệ thống camera kết hợp cùng âm thanh tân tiến.",
                shortDesc: "Apple M2 GPU 8 nhân",
                quantity: 99,
                factory: "APPLE",
                target: "MONG-NHE",
                image: "1711080787179-apple-02.png"
            },
            {
                name: "Laptop Acer Nitro",
                price: 23490000,
                detailDesc: "Là chiếc laptop gaming thế hệ mới nhất thuộc dòng Nitro 5 luôn chiếm được rất nhiều cảm tình của game thủ trước đây, Acer Nitro Gaming AN515-58-769J nay còn ấn tượng hơn nữa với bộ vi xử lý Intel Core i7 12700H cực khủng và card đồ họa RTX 3050, sẵn sàng cùng bạn chinh phục những đỉnh cao.",
                shortDesc: "AN515-58-769J i7 12700H",
                quantity: 99,
                factory: "ACER",
                target: "SINHVIEN-VANPHONG",
                image: "1711080948771-acer-01.png"
            },
            {
                name: "Laptop Acer Nitro V",
                price: 26999000,
                detailDesc: "15.6 inch, FHD (1920 x 1080), IPS, 144 Hz, 250 nits, Acer ComfyView LED-backlit",
                shortDesc: "NVIDIA GeForce RTX 4050",
                quantity: 99,
                factory: "ASUS",
                target: "MONG-NHE",
                image: "1711081080930-asus-03.png"
            },
            {
                name: "Laptop Dell Latitude 3420",
                price: 21399000,
                detailDesc: "Dell Inspiron N3520 là chiếc laptop lý tưởng cho công việc hàng ngày. Bộ vi xử lý Intel Core i5 thế hệ thứ 12 hiệu suất cao, màn hình lớn 15,6 inch Full HD 120Hz mượt mà, thiết kế bền bỉ sẽ giúp bạn giải quyết công việc nhanh chóng mọi lúc mọi nơi.",
                shortDesc: "Intel Iris Xe Graphics",
                quantity: 99,
                factory: "DELL",
                target: "MONG-NHE",
                image: "1711081278418-dell-02.png"
            }
        ];

        await prisma.product.createMany({
            data: products
        })
        console.log("✅ Đã thêm products");
    }
    if (countRole !== 0 && countUser !== 0 && countProduct !== 0) {
        console.log("Database already seeded with users.");
    }
}

main()
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
