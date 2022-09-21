const jwt = require('jsonwebtoken')
const fs = require('fs')
const path = require('path')

const SERVER_URL = 'http://localhost:3000'
const secret = "I am zc";

const FileTypes = {
    js: 'widget.umd.js',
    css: 'style.css',
    config: 'config.json'
}

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

const deleteFolder = (folderPath) => {
    if(fs.existsSync(folderPath)){
        let files = []
        files = fs.readdirSync(folderPath)
        files.forEach(file => {
          let currPath = path.join(folderPath, file)
          const isDir = fs.lstatSync(currPath).isDirectory()
          if(isDir){
            deleteFolder(currPath)
          }else{
            fs.unlinkSync(currPath)
          }
        })
    }
    fs.rmdirSync(folderPath)
  }

module.exports = {
    vertifyToken,
    SERVER_URL,
    deleteFolder,
    FileTypes
};
