/**
 * 创建项目模板
 */

const fs = require("fs");
const path = require("path");
const ora = require("ora");
const download = require("download-git-repo");
const chalk = require("chalk");

const mkdirSync = (dirPath) => {
  fs.mkdirSync(dirPath);
};

const downloadTemplate = (projectPath) => {
  const gitPath = "direct:https://gitee.com/angus-zc/widget-template.git";
  return new Promise((resolve, reject) => {
    try {
      download(gitPath, projectPath, { clone: true }, function (err) {
        if (err) return reject(err);
        resolve();
      });
    } catch (err) {
      console.log(err);
      reject(err);
    }
  });
};

module.exports = async (projectName) => {
  //   模板存放的目录
  const targetPath = process.cwd();
  const projectPath = path.join(targetPath, projectName);

  const create = async (projectPath) => {
    const spinner = ora("🗃 开始下载模版...").start();

    mkdirSync(projectPath);

    await downloadTemplate(projectPath);

    spinner.succeed("🎉 模版下载完成");
    console.log();
  };

  const initConfig = (projectPath) => {
    console.info("🚀 初始化文件配置信息...");
    console.log()

    const pckPath = path.join(projectPath, "/package.json");
    const package = require(pckPath);
    const newPackage = JSON.stringify({ ...package, name: projectName });

    fs.writeFileSync(pckPath, newPackage, "utf8");
    
    console.log(chalk.green(`🎉 你的项目 ${projectName} 已创建成功！`));
    console.log();

    console.log(chalk.green(`🎉 cd ${projectName}`));
    console.log()
    console.log(chalk.green(`🎉 yarn`));
  };

  await create(projectPath)
  initConfig(projectPath)
};
