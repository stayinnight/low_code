const jwt = require("jsonwebtoken");
const secret = "I am zc";

const vertifyToken = (token, ctx) => {
    if (!token) {
        ctx.body = { status: 201, message: "token为空！" };
    }
    return new Promise((resolve, reject) => {
        jwt.verify(token, secret, (err, info) => {
            if (err) {
                ctx.body = { status: 404, message: "没有该用户！" };
                reject(err);
            } else {
                resolve(info);
            }
        });
    });
};

const findPageIndex = (pages, pageId) => {
    return pages.findIndex((page) => {
        return page.id === pageId;
    });
};

const getPageById = (pageId, pages) => {
    return pages.find((page) => {
        return page.id === pageId;
    });
};

const FileTypes = {
    js: 'widget.umd.js',
    css: 'style.css',
    config: 'config.json'
}


module.exports = {
    vertifyToken,
    findPageIndex,
    getPageById,
    FileTypes
};
