const Koa = require("koa");
const app = new Koa();
const router = require("./router/router");
const body = require("koa-body");

app.use(
    body({
        enableTypes: ["json", "form", "text"],
        multipart: true,
    })
);

/*设置允许跨域---注意这里设置跨域必须在设置路由前面，否则没有效果*/
app.use(async (ctx, next) => {
    ctx.set("Access-Control-Allow-Origin", "*"); // 很奇怪的是，使用 * 会出现一些其他问题
    ctx.set("Access-Control-Allow-Headers", "content-type");
    ctx.set(
        "Access-Control-Allow-Methods",
        "OPTIONS,GET,HEAD,PUT,POST,DELETE,PATCH"
    );
    await next();
});

app.use(router.routes());
app.use(router.allowedMethods());

module.exports = app;
