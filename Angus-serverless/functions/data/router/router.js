const Router = require("koa-router");
const router = new Router();
const uuid = require("uuid");
const { db, app } = require("../db/db");
const { vertifyToken, findPageIndex, getPageById, FileTypes } = require("../utils/util");

router.get("/getpages", async (ctx) => {
    const { token } = ctx.query;
    const info = await vertifyToken(token, ctx);
    const { username } = info;
    const user = await db.collection("users").where({ username }).get();
    if (user.data.length > 0) {
        const pages = user.data[0].pages;
        ctx.body = {
            status: 200,
            data: { pages },
            message: "获取页面数据成功！",
        };
    } else {
        ctx.body = {
            message: "用户不存在！",
            status: 404,
        };
    }
});

router.get("/addpage", async (ctx) => {
    const { pageInfo, token } = ctx.query;
    const id = uuid.v1();

    const info = await vertifyToken(token, ctx);
    const { username } = info;

    const user = await db.collection("users").where({ username }).get();

    if (user.data.length > 0) {
        const _ = db.command;
        const newPage = { ...JSON.parse(pageInfo), id };
        try {
            await db
                .collection("users")
                .where({ username })
                .update({ pages: _.push(newPage) });
            ctx.body = {
                message: "添加页面成功！",
                status: 200,
                page: newPage,
            };
        } catch (e) {
            console.log(e);
            ctx.body = {
                message: "服务器错误！",
                status: 500,
            };
        }
    } else {
        ctx.body = {
            message: "用户不存在！",
            status: 201,
        };
    }
});

router.get("/delpage", async (ctx) => {
    const { token, pageId } = ctx.query;
    const info = await vertifyToken(token, ctx);

    const { username } = info;
    const user = await db.collection("users").where({ username }).get();

    if (user.data.length > 0) {
        const pages = user.data[0].pages;
        const index = pages.findIndex((page) => {
            return page.id === pageId;
        });
        pages.splice(index, 1);
        try {
            await db.collection("users").where({ username }).update({
                pages,
            });
            ctx.body = {
                status: 200,
                message: "删除成功！",
            };
        } catch (e) {
            ctx.body = {
                status: 500,
                message: "服务器错误！",
            };
        }
    } else {
        ctx.body = {
            status: 404,
            message: "用户不存在！",
        };
    }
});

router.post("/save", async (ctx) => {
    const { token, componentData, pageId } = ctx.request.body;
    const info = await vertifyToken(token, ctx);

    const { username } = info;
    const user = await db.collection("users").where({ username }).get();

    if (user.data.length > 0) {
        try {
            const getNewPage = (user, pageId, componentData) => {
                const oldPages = user.data[0].pages;
                const newPages = [...oldPages];
                const index = findPageIndex(oldPages, pageId);
                newPages[index].componentData = componentData;
                return newPages;
            };

            const newPages = getNewPage(user, pageId, componentData);
            await db
                .collection("users")
                .where({ username })
                .update({ pages: newPages });

            ctx.body = {
                message: "保存成功！",
                status: 200,
            };
        } catch (e) {
            ctx.body = {
                message: "服务器错误！",
                status: 500,
            };
        }
    } else {
        ctx.body = {
            message: "用户不存在！",
            status: 404,
        };
    }
});

router.get("/getdata", async (ctx) => {
    const { pageId, token } = ctx.query;
    const info = await vertifyToken(token, ctx);
    const { username } = info;
    const user = await db.collection("users").where({ username }).get();

    if (user.data.length > 0) {
        const pages = user.data[0].pages;
        const index = findPageIndex(pages, pageId);
        const componentData = pages[index] ? pages[index].componentData : [];

        ctx.body = {
            status: 200,
            data: componentData,
            message: "查询成功！",
        };
    } else {
        ctx.body = {
            message: "用户不存在！",
            status: 404,
        };
    }
});

router.post("/publish", async (ctx) => {
    const { token } = ctx.request.body;
    const { username } = await vertifyToken(token);
    const user = await db.collection("users").where({ username }).get();

    if (user.data.length > 0) {
        await new Promise((resolve) => {
            setTimeout(() => {
                ctx.body = {
                    status: 200,
                    message: "部署成功！",
                };
                resolve();
            }, 2000);
        });
    } else {
        ctx.body = {
            status: 404,
            message: "没有该用户！",
        };
    }
    // startZIP();
});

router.post("/generate_json", async (ctx) => {
    const { token, pageId } = ctx.request.body;

    const { username } = await vertifyToken(token);
    const user = await db.collection("users").where({ username }).get();

    if (user.data.length > 0) {
        const id = uuid.v1();

        const pages = user.data[0].pages;
        const page = getPageById(pageId, pages);

        const upload = await app.uploadFile({
            cloudPath: `${id}/page.json`,
            fileContent: JSON.stringify(page.componentData),
        });

        ctx.body = {
            status: 200,
            message: "生成成功！",
            fileID: upload.fileID,
        };
    } else {
        ctx.body = {
            status: 404,
            message: "没有该用户！",
        };
    }
});

router.post("/delete_json", async (ctx) => {
    const { token, fileID } = ctx.request.body;

    const { username } = await vertifyToken(token);
    const user = await db.collection("users").where({ username }).get();

    if (user.data.length > 0) {
        await app.deleteFile({
            fileList: [fileID],
        });
        ctx.body = {
            status: 200,
            message: "删除成功！",
        };
    } else {
        ctx.body = {
            status: 404,
            message: "没有该用户！",
        };
    }
});

router.get("/get_pages_byid", async (ctx) => {
    const { userId } = ctx.query;
    const user = await db.collection("users").where({ _id: userId }).get();
    if (user.data.length > 0) {
        const pages = user.data[0].pages;

        ctx.body = {
            status: 200,
            data: { pages },
            message: "获取页面数据成功！",
        };
    } else {
        ctx.body = {
            message: "用户不存在！",
            status: 404,
        };
    }
});

router.get("/get_widgets_byid", async (ctx) => {
    const { userId } = ctx.query;
    const user = await db.collection("users").where({ _id: userId }).get();
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
                props = widgets[i].props;
            for (let j = 0; j < fileID.length; j++) {
                const id = fileID[j];
                if (isComponent(id)) {
                    component.component = (
                        await getUrlById(id)
                    ).fileList[0].tempFileURL;
                } else if (isCss(id)) {
                    component.style = (
                        await getUrlById(id)
                    ).fileList[0].tempFileURL;
                } else if (isConfig(id)) {
                    component.config = (
                        await getUrlById(id)
                    ).fileList[0].tempFileURL;
                }
            }
            component.props = JSON.parse(props);
            components.push(component);
        }

        ctx.body = {
            status: 200,
            data: { components },
            message: "获取组件数据成功！",
        };
    } else {
        ctx.body = {
            message: "用户不存在！",
            status: 404,
        };
    }
});

module.exports = router;
