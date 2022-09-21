/**
 * 发布组件
 */

const { execSync } = require("child_process");
const axios = require("axios");
const ora = require("ora");
const fs = require("fs");
const path = require("path");
const inquirer = require("inquirer");
const chalk = require("chalk");
const { vaild, FileTypes } = require("../utils/util");
const tcb = require("@cloudbase/node-sdk");
const uuid = require("uuid");

const initAxios = () => {
  const BASE_URL =
    "https://angus-server-6g36j4y8db4fbe91-1306774321.ap-shanghai.app.tcloudbase.com";
  axios.defaults.baseURL = BASE_URL;
  axios.defaults.timeout = 3000;
};

const promptList = [
  {
    type: "input",
    message: "请输入用户名: ",
    name: "username",
    default: "none", // 默认值
  },
  {
    type: "input",
    message: "请输入密码:",
    name: "password",
    default: "none",
  },
];

module.exports = async () => {
  const projectPath = process.cwd();

  // 当前登录的用户
  let user = null;

  const app = tcb.init({
    env: "angus-server-6g36j4y8db4fbe91",
    secretId: "AKIDdMrIURAetuhIemfJsIVouvkJcfS0IK6u",
    secretKey: "e4FCvObYFkyxgAPO8MK4Y9WgcJo46uTn",
  });
  const db = app.database();

  // 打包组件
  const pack = () => {
    const spinner = ora("🗃 开始打包组件... 🗃").start();
    execSync("npm run build");
    spinner.succeed("🎉 组件打包完成完成！🎉");
  };

  const isSend = async () => {
    const types = await db.collection("widgets").get();
    const configPath = path.join(projectPath, "src/widget/config.json");
    const config = fs.readFileSync(configPath, "utf-8");
    const { type } = JSON.parse(config);

    const isInServer = (types, type) => {
      return (
        types.data.findIndex((item) => {
          return item.type === type;
        }) !== -1
      );
    };

    return isInServer(types, type) ? false : true;
  };

  // 发送文件到服务器
  const send = async () => {
    if (!user) return;

    const spinner = ora("🗃 正在上传组件... 🗃").start();

    const codePath = path.join(projectPath, "dist/widget.umd.js");
    const stylePath = path.join(projectPath, "dist/style.css");
    const configPath = path.join(projectPath, "src/widget/config.json");

    const isComponent = (id) => id.includes(FileTypes.js);
    const isCss = (id) => id.includes(FileTypes.css);
    const isConfig = (id) => id.includes(FileTypes.config);

    const getName = (path)=>{
      if(isComponent(path)){
        return FileTypes.js
      }else if(isCss(path)){
        return FileTypes.css
      }else if (isConfig(path)){
        return FileTypes.config
      }
    }

    const config = fs.readFileSync(configPath, "utf-8");
    const { type } = JSON.parse(config);

    const items = [codePath, stylePath, configPath];

    try {
      const id = uuid.v1();
      const file = {
        type,
        fileID: [],
        props: config
      };

      for (let i = 0; i < items.length; i++) {
        const path = items[i];
        const name = getName(path)
        const res = await app.uploadFile({
          cloudPath: `${id}/${name}`,
          fileContent: fs.createReadStream(path),
        });
        file.fileID.push(res.fileID);
      }

      await db.collection("widgets").add(file);

      spinner.succeed("🎉 您的组件已上传成功！🎉");
    } catch (e) {
      console.log(e);
      spinner.fail("🎉 上传失败! 🎉");
    }
  };

  const login = async () => {
    const answer = await inquirer.prompt(promptList);
    const { username, password } = answer;

    try {
      const result = await axios.get("/user/login", {
        params: {
          userName: username,
          password,
        },
      });
      const { message, data, status } = result.data;
      if (status === 200) user = data;

      console.log(chalk.green(message));
    } catch (e) {
      console.log("服务器错误，请稍后再试！");
    }
  };

  const vertifyConfig = () => {
    const configPath = path.join(projectPath, "./src/widget/config.json");
    const config = fs.readFileSync(configPath);
    const json = JSON.parse(config);
    const isVaild = vaild(json);
    return isVaild;
  };

  if (await isSend()) {
    const isVaile = vertifyConfig();
    if (!isVaile) {
      return;
    } else {
      console.log(chalk.green("🎉配置验证通过！🎉"));
      initAxios();
      await login();
      pack();
      send();
    }
  } else {
    console.log(chalk.red("🎉 该类型的组件已存在！ 🎉"));
  }
};
