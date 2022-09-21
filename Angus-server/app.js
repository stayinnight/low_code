const Koa = require("koa");
const router = require("./router/index");
const body = require("koa-body");
const views = require("koa-views");
const static = require("koa-static");
const path = require("path");
require("./data/index");

/*实例化App和Router*/
const app = new Koa();

// 使用中间件，利用path模块的方法拼接出静态文件目录的绝对路径
const staticPath = path.join(__dirname, './public')
app.use(static(staticPath));

// // 配置模板引擎
app.use(views("./public/build", { map: { html: "ejs" } }));

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

/*配置router中间件*/
app.use(router.routes());
app.use(router.allowedMethods());


/*监听端口*/
app.listen(3000, () => {
  console.log("The server is runing in 3000");
});
