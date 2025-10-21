import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { prisma } from "../config/client.js";
import { ACCOUNT_TYPE } from "../config/constant.js";
import process from "process";

export const configPassportGoogle = () => {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:9092/api/auth/google/callback",
                scope: ["profile", "email"],
            },
            async function verify(accessToken, refreshToken, profile, callback) {
                try {
                    console.log(">> Google profile:", profile);

                    const email = profile.emails?.[0]?.value;
                    if (!email) {
                        return callback(new Error("Email not provided by Google"), null);
                    }

                    // Tìm user theo email
                    let user = await prisma.user.findUnique({
                        where: { email },
                        include: { role: true },
                    });

                    // Nếu user chưa tồn tại, tạo mới
                    if (!user) {
                        // Lấy role USER mặc định
                        const userRole = await prisma.role.findUnique({
                            where: { name: "USER" },
                        });

                        if (!userRole) {
                            return callback(new Error("Default user role not found"), null);
                        }

                        user = await prisma.user.create({
                            data: {
                                email,
                                fullName: profile.displayName || email.split("@")[0],
                                avatar: profile.photos?.[0]?.value,
                                accountType: ACCOUNT_TYPE.GOOGLE,
                                roleId: userRole.id,
                                // Google OAuth không cần password
                                password: "",
                            },
                            include: { role: true },
                        });

                        console.log(">> Created new user from Google:", user.email);
                    } else {
                        // Cập nhật thông tin nếu user đã tồn tại
                        user = await prisma.user.update({
                            where: { id: user.id },
                            data: {
                                fullName: profile.displayName || user.fullName,
                                avatar: profile.photos?.[0]?.value || user.avatar,
                                accountType: ACCOUNT_TYPE.GOOGLE,
                            },
                            include: { role: true },
                        });

                        console.log(">> Updated existing user from Google:", user.email);
                    }

                    return callback(null, user);
                } catch (error) {
                    console.error(">> Google OAuth error:", error);
                    return callback(error, null);
                }
            }
        )
    );
};
