const Router = require("koa-router");
const db = require("../db/db");
const { bcryptPassword, confirmPassword, secret } = require("../utils/uril.");
const jwt = require("jsonwebtoken");
const router = new Router();

router.get("/login", async (ctx) => {
    const { userName, password } = ctx.query;
    const user = await db
        .collection("users")
        .where({
            username: userName,
        })
        .get();
    if (user.data.length > 0) {
        const hash = user.data[0].password;
        const isTrue = confirmPassword(password, hash);
        const userId = user.data[0]._id;
        const info = { username: userName, password };
        const token = jwt.sign(info, secret);
        if (isTrue) {
            ctx.body = {
                status: 200,
                message: "登录成功！",
                data: { userId, token, userName },
            };
        } else {
            ctx.body = {
                status: 201,
                message: "密码错误！",
            };
        }
    } else {
        ctx.body = {
            status: 404,
            message: "用户不存在！",
        };
    }
});

router.get("/register", async (ctx) => {
    const { userName, password } = ctx.query;
    const user = await db
        .collection("users")
        .where({
            username: userName,
        })
        .get();
    if (user.data.length > 0) {
        ctx.body = {
            status: 201,
            message: "用户已存在！",
        };
    } else {
        try {
            const hash = bcryptPassword(password);
            await db.collection("users").add({
                username: userName,
                password: hash,
                pages: [],
            });
            ctx.body = {
                status: 200,
                message: "注册成功！",
            };
        } catch (e) {
            console.log(e);
            ctx.body = {
                status: 500,
                message: "服务器错误！",
            };
        }
    }
});

module.exports = router;
