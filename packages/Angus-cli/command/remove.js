/**
 * 删除指定type的组件
 */
const inquirer = require("inquirer");
const axios = require("axios");
const tcb = require("@cloudbase/node-sdk");
const chalk = require("chalk");

const removeList = (widgetsNames) => {
  return [
    {
      type: "list",
      message: `请选择你要删除的组件: `,
      name: "name",
      choices: widgetsNames,
    },
  ];
};

const confirmPassword = [
  {
    type: "input",
    message: "请输入用户名:",
    name: "userName",
    default: "", // 默认值
  },
  {
    type: "input",
    message: "请输入密码:",
    name: "password",
    default: "", // 默认值
  },
];

const initAxios = () => {
  const BASE_URL =
    "https://angus-server-6g36j4y8db4fbe91-1306774321.ap-shanghai.app.tcloudbase.com";
  axios.defaults.baseURL = BASE_URL;
  axios.defaults.timeout = 5000;
};

initAxios();

module.exports = async () => {
  // 保存当前登录用户
  let user = null;

  const app = tcb.init({
    env: "angus-server-6g36j4y8db4fbe91",
    secretId: "AKIDdMrIURAetuhIemfJsIVouvkJcfS0IK6u",
    secretKey: "e4FCvObYFkyxgAPO8MK4Y9WgcJo46uTn",
  });
  const db = app.database();

  const { userName, password } = await inquirer.prompt(confirmPassword);

  const result = await axios.get("/user/login", {
    params: {
      userName,
      password,
    },
  });
  const { status, message, data } = result.data;

  if (status === 200) {
    user = data;
    console.log(chalk.green("🎉 登录成功！🎉"));
    console.log();

    const widgets = await db.collection("widgets").get();

    const getWidgetsName = (widgets) => {
      return widgets.map((w) => {
        return w.type;
      });
    };

    const widgetNames = getWidgetsName(widgets.data);
    const { name } = await inquirer.prompt(removeList(widgetNames));

    const deleteWidget = async (name) => {

      const widgets = await db.collection("widgets").get();
      const fileID = widgets.data.find((w) => {
        return w.type === name;
      }).fileID;
      await app.deleteFile({
        fileList: fileID,
      });

      await db.collection("widgets").where({ type: name }).remove();

    };

    await deleteWidget(name);
    console.log(chalk.green(`🚀 删除成功！ 🚀`));
  } else {
    console.log(chalk.red(`🚀 ${message} 🚀`));
    console.log();
  }
};
