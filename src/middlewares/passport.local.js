import { prisma } from "../config/client.js";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { countUserSumCart, findUserWithRoleById } from "../services/auth.service.js";
import { comparePassword } from "../services/auth.service.js";

export const configPassportLocal = () => {
    passport.use(
        new LocalStrategy(
            {
                passReqToCallback: true,
            },
            async function verify(req, username, password, callback) {
                const session = req.session;
                if (session?.messages?.length) {
                    session.messages = [];
                }

                console.log(">> Check user:", username, password);

                const user = await prisma.user.findUnique({
                    where: { username },
                });

                if (!user) {
                    return callback(null, false, {
                        message: "Username hoặc password không đúng",
                    });
                }

                const isMatch = await comparePassword(password, user.password);
                if (!isMatch) {
                    return callback(null, false, {
                        message: "Username hoặc password không đúng",
                    });
                }

                return callback(null, user);
            }
        )
    );

    passport.serializeUser(function (user, callback) {
        callback(null, {
            id: user.id,
            username: user.username,
        });
    });

    passport.deserializeUser(async function (user, callback) {
        const { id } = user;

        try {

            const userInDB = await findUserWithRoleById(id);
            const sumCart = await countUserSumCart(id);

            return callback(null, { ...userInDB, sumCart });
        } catch (error) {
            return callback(error);
        }
    });
};

