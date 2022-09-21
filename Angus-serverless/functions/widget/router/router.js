const Router = require("koa-router");
const router = new Router();
const { db, app } = require("../db/db");
const { vertifyToken, FileTypes } = require("../utils/util");

router.get("/get_widgets", async (ctx) => {
    const { token } = ctx.query;
    const { username } = await vertifyToken(token, ctx);

    const user = await db.collection("users").where({ username }).get();

    if (user.data.length > 0) {
        const components = [];
        const widgets = (await db.collection("widgets").get()).data;

        const getUrlById = async (id) => {
            return await app.getTempFileURL({
                fileList: [id],
            });
        };

        const isComponent = (id) => id.includes(FileTypes.js);
        const isCss = (id) => id.includes(FileTypes.css);
        const isConfig = (id) => id.includes(FileTypes.config);

        for (let i = 0; i < widgets.length; i++) {
            const component = {},
                fileID = widgets[i].fileID,
                props = widgets[i].props
            for (let j = 0; j < fileID.length; j++) {
                const id = fileID[j];
                if (isComponent(id)) {
                    component.component = (await getUrlById(id)).fileList[0].tempFileURL
                } else if (isCss(id)) {
                    component.style = (await getUrlById(id)).fileList[0].tempFileURL
                } else if (isConfig(id)) {
                    component.config = (await getUrlById(id)).fileList[0].tempFileURL
                }
            }
            component.props = JSON.parse(props)
            components.push(component);
        }

        ctx.body = {
            status: 200,
            message: "获取组件成功！",
            components,
        };
    } else {
        ctx.body = {
            status: 404,
            message: "用户不存在！",
        };
    }
});

module.exports = router;
