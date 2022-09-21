const JSZIP = require("jszip");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const path = require("path");
const jwt = require("jsonwebtoken");
const { v5 } = require("uuid");

const zip = new JSZIP();
const secret = "I am zc";
const MY_NAMESPACE = "1b671a64-40d5-491e-99b0-da01ff1f3341";
const SERVER_URL = 'http://localhost:3000'


const bcryptPassword = (password) => {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  return hash;
};

const confirmPassword = (password, hash) => {
  const flag = bcrypt.compareSync(password, hash);
  return flag;
};

const readDir = (zip, dirPath) => {
  // 读取dist下的根文件目录
  const files = fs.readdirSync(dirPath);
  files.forEach((fileName) => {
    const fillPath = dirPath + "/" + fileName;
    const file = fs.statSync(fillPath);
    // 如果是文件夹的话需要递归遍历下面的子文件
    if (file.isDirectory()) {
      const dirZip = zip.folder(fileName);
      readDir(dirZip, fillPath);
    } else {
      // 读取每个文件为buffer存到zip中
      zip.file(fileName, fs.readFileSync(fillPath));
    }
  });
};

//开始压缩文件
const startZIP = () => {
  const currPath = __dirname; //文件的绝对路径 当前当前js所在的绝对路径
  const targetDir = path.join(currPath, "../template/test");
  const zipPath = path.join(currPath, "../template/dist.zip");
  readDir(zip, targetDir);
  return zip
    .generateAsync({
      type: "nodebuffer", //nodejs用
    })
    .then(function (content) {
      fs.writeFileSync(zipPath, content, "utf-8"); //将打包的内容写入 当前目录下的 result.zip中
    })
    .catch((err) => {
      console.log(err);
    });
};

const showErr = (err) => {
  if (err) throw err;
};

const vertifyToken = (token, ctx) => {
  if (!token) {
    ctx.body = {
      status: 201,
      message: "token为空！",
    };
  }

  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, info) => {
      if (err) {
        ctx.body = {
          status: 404,
          message: "没有该用户！",
        };
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
/*转换大小写*/
const toCapital = (str) => {
  const firstChar = str[1].toUpperCase();
  const tail = str.slice(2);
  return firstChar + tail;
};

const gainPageName = (str) => str.slice(1);

const getWidgetNames = (componentData) => {
  const widgetNames = componentData.map((widget) => {
    return widget.type;
  });
  return [...new Set(widgetNames)];
};

const filterProps = (widget) => {
  const isProps = (prop) => {
    const preProps = ["propValue", "title", "placeholder", "style", "url"];
    const index = preProps.findIndex((name) => {
      return name == prop;
    });
    return index !== -1;
  };

  const props = Reflect.ownKeys(widget).filter((prop) => {
    if (isProps(prop)) return prop;
  });

  const template = `<${widget.type}

  ${props
    .map((prop) => {
      if (prop === "url") {
        const hasExist = (imgId) => {
          const imgs = path.join(__dirname, "../template/test/src/assets/imgs");
          const files = fs.readdirSync(imgs);

          const exist =
            files.findIndex((fileName) => {
              return fileName === imgId;
            }) !== -1;
          return exist;
        };

        const base64 = `${widget[prop]}`;
        const imgId = v5(base64, MY_NAMESPACE);
        const imgName = imgId.replace(/[0-9]/g, "a").replace(/-/g, "b");

        if (!hasExist(imgId)) {
          const imgPath = path.join(
            __dirname,
            `../template/test/src/assets/imgs/${imgId}.js`
          );
          fs.writeFileSync(
            imgPath,
            `const path =

              \`${base64}\`
              
              export default path
            `,
            "utf-8"
          );
        }

        return `${prop}={${imgName}}\n`;
      }
      if (prop === "style") {
        return `${prop}={${JSON.stringify(widget[prop])}}\n`;
      }

      if (widget[prop]) {
        return `${prop}={'${widget[prop]}'}\n`;
      }
    })
    .join("")}

  />`;
  return template;
};

const getImgaes = (componentData) => {
  const base64s = componentData
    .filter((widget) => widget.url !== undefined)
    .map((widget) => v5(widget.url, MY_NAMESPACE));
  return base64s;
};

const getPageById = (pageId, pages) => {
  return pages.find((page) => {
    return page.id === pageId
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
  bcryptPassword,
  confirmPassword,
  secret,
  startZIP,
  showErr,
  vertifyToken,
  findPageIndex,
  toCapital,
  gainPageName,
  getWidgetNames,
  filterProps,
  getImgaes,
  getPageById,
  SERVER_URL,
  deleteFolder
};
