const fs = require("fs");
const path = require("path");
const Router = require("koa-router");
const User = require("../data/schema/login");
const jwt = require("jsonwebtoken");
const send = require("koa-send");
const {
  bcryptPassword,
  confirmPassword,
  secret,
  startZIP,
  showErr,
  vertifyToken,
  findPageIndex,
  toCapital,
  getWidgetNames,
  filterProps,
  getImgaes,
  getPageById,
  SERVER_URL,
  deleteFolder,
} = require("../utils/index");
const uuid = require("uuid");
const router = new Router();

/*配置router路由*/
router.get("/login", async (ctx) => {
  const { userName, password } = ctx.query;

  /*查找用户*/
  await new Promise((resolve) => {
    User.find({ username: userName }, (err, result) => {
      showErr(err);

      if (result.length > 0) {
        /*验证密码*/
        const flag = confirmPassword(password, result[0].password);

        const userId = result[0].id;
        const info = {
          username: userName,
          password,
        };
        const token = jwt.sign(info, secret);

        /*如果验证密码通过*/
        if (flag) {
          ctx.body = {
            status: 200,
            message: "登录成功！",
            data: {
              userId,
              token,
              userName,
            },
          };
          resolve();
        } else {
          ctx.body = {
            status: 201,
            message: "密码错误！",
          };
          resolve();
        }
      } else {
        ctx.body = {
          status: 404,
          message: "没有该用户！",
        };
        resolve();
      }
    });
  });
});
/*注册路由*/
router.post("/register", async (ctx) => {
  const { userName, password } = ctx.request.body;

  const result = await User.find({ username: userName }, async (err) => {
    showErr(err);
  });
  /*如果数据库里面已经有了这个用户*/
  if (result.length > 0) {
    ctx.body = {
      status: 201,
      message: "用户已存在！",
    };
  } else {
    /*将密码转换成hash*/
    const hash = bcryptPassword(password);
    const newUser = new User({
      username: userName,
      password: hash,
    });

    await new Promise((resolve, reject) => {
      newUser.save((err) => {
        if (err) return reject(err);

        ctx.body = {
          status: 200,
          message: "注册成功！",
        };
        resolve();
      });
    });
  }
});

router.get("/getpages", async (ctx) => {
  const { token } = ctx.query;
  const info = await vertifyToken(token, ctx);
  const { username } = info;
  const user = await User.find({ username });
  if (user.length > 0) {
    const pages = user[0].pages;
    ctx.body = {
      status: 200,
      data: { pages },
      message: "获取页面数据成功！",
    };
  } else {
    ctx.body = {
      status: 404,
      message: "找不到用户！",
    };
  }
});

router.post("/addpage", async (ctx) => {
  const { pageInfo, token } = ctx.request.body;
  const id = uuid.v1();

  const info = await vertifyToken(token, ctx);
  const { username } = info;

  const findUser = async () => {
    const user = await User.find({ username });
    if (user.length > 0) return user;
    return null;
  };

  const user = await findUser();

  if (user.length > 0) {
    const addPage = (pageInfo) => {
      const newPages = user[0].pages;
      newPages.push({ ...pageInfo, id });
      return newPages;
    };

    const newPages = addPage(pageInfo);

    const updatePages = async () => {
      await User.updateOne(
        { username: username },
        { pages: newPages },
        (err) => {
          showErr(err);
        }
      );
    };
    await updatePages();

    ctx.body = {
      status: 200,
      message: "添加页面成功！",
      page: { ...pageInfo, id },
    };
  } else {
    ctx.body = {
      status: 404,
      message: "没有用户信息！",
    };
  }
});

router.post("/delpage", async (ctx) => {
  const { token, pageId } = ctx.request.body;
  const info = await vertifyToken(token, ctx);

  const { username } = info;

  const user = await User.find({ username });

  const getNewPages = () => {
    const oldPages = user[0].pages;
    const newPages = user[0].pages;
    const index = findPageIndex(oldPages, pageId);
    newPages.splice(index, 1);
    return newPages;
  };

  const newPages = getNewPages();

  await User.updateOne({ username: username }, { pages: newPages }, (err) => {
    if (err) {
      ctx.body = {
        status: 500,
        message: "删除失败！",
      };
    }
  });

  ctx.body = {
    status: 200,
    message: "删除成功！",
  };
});

router.post("/save", async (ctx) => {
  const { token, componentData, pageId } = ctx.request.body;
  const info = await vertifyToken(token, ctx);

  const { username } = info;
  const user = await User.find({ username });

  const update = async () => {
    const oldPages = user[0].pages;
    const newPages = [...oldPages];
    const index = findPageIndex(oldPages, pageId);
    newPages[index].componentData = componentData;

    return new Promise((resolve, reject) => {
      User.updateOne({ username: username }, { pages: newPages }, (err) => {
        if (err) {
          ctx.body = {
            status: 500,
            message: "保存失败！",
          };
          reject(err);
        } else {
          ctx.body = {
            status: 200,
            message: "保存成功！",
          };
          resolve();
        }
      });
    });
  };

  if (user.length > 0) {
    await update();
  }
});

router.get("/getdata", async (ctx) => {
  const { pageId, token } = ctx.query;
  const info = await vertifyToken(token, ctx);
  const { username } = info;
  const user = await User.find({ username: username });

  if (user.length > 0) {
    const pages = user[0].pages;
    const index = findPageIndex(pages, pageId);
    const componentData = pages[index] ? pages[index].componentData : [];

    ctx.body = {
      status: 200,
      data: componentData,
      message: "查询成功！",
    };
  }
});

router.post("/publish", async (ctx) => {
  const { token } = ctx.request.body;
  const { username } = await vertifyToken(token);
  const user = await User.find({ username: username });

  if (user.length > 0) {
    ctx.body = {
      status: 200,
      message: "部署成功！",
    };
  } else {
    ctx.body = {
      status: 404,
      message: "没有该用户！",
    };
  }
  // startZIP();
});

router.get("/download", async (ctx) => {
  const distPath = path.join(__dirname, "../template/");
  await startZIP();
  ctx.attachment();
  await send(ctx, "dist.zip", { root: distPath });
});

router.get("/pageJson", async (ctx) => {
  const JOSNpath = path.join(__dirname, "../template/");
  ctx.attachment();
  await send(ctx, "page.json", { root: JOSNpath });
});

router.get("/generate_json", async (ctx) => {
  const { token } = ctx.query;
  const { username } = await vertifyToken(token);
  const user = await User.find({ username: username });

  if (user.length > 0) {
    const pages = user[0].pages;
    const { pageId } = ctx.query;
    const page = getPageById(pageId, pages);
    const data = JSON.stringify(page.componentData);

    const pageJsonPath = path.resolve(__dirname, "../template/page.json");
    fs.writeFileSync(pageJsonPath, data, "utf8");

    ctx.body = {
      status: 200,
      message: "生成成功！",
    };
  } else {
    ctx.body = {
      status: 404,
      message: "没有该用户！",
    };
  }
});

router.post("/publish_widgets", async (ctx) => {
  const { token, widget } = ctx.request.body;
  const { username } = await vertifyToken(token, ctx);

  const findUser = async () => {
    const user = await User.find({ username });
    if (user.length > 0) return user;
    return [];
  };

  const user = await findUser();
  if (user.length > 0) {
    const getUniqueFilePath = () => {
      const id = uuid.v1();
      const widgetPath = path.join(__dirname, `../public/widgets/${id}`);
      return widgetPath;
    };

    const getTypes = () => {
      const types = [];
      const widgetsPath = path.join(__dirname, "../public/widgets");
      const widgetDirArr = fs.readdirSync(widgetsPath);

      widgetDirArr.forEach((dirPath) => {
        const filePath = path.join(widgetsPath, dirPath);
        const filesArr = fs.readdirSync(filePath);

        filesArr.forEach((fileName) => {
          const [name, exename] = fileName.split(".");
          if (exename === "js") {
            types.push(name);
          }
        });
      });

      return types;
    };

    const hasType = (type, types) => {
      return (
        types.findIndex((t) => {
          return t === type;
        }) !== -1
      );
    };

    const { component, type, config, style } = widget;
    const hasInServer = hasType(type, getTypes());

    if (hasInServer) {
      ctx.body = {
        status: 201,
        message: "该类型组件已存在！",
      };
    } else {
      const uniquePath = getUniqueFilePath();

      const getPath = (uniquePath, fileName) => {
        return path.join(uniquePath, fileName);
      };

      try {
        fs.mkdirSync(uniquePath);

        fs.writeFileSync(getPath(uniquePath, `${type}.js`), component);
        fs.writeFileSync(getPath(uniquePath, "style.css"), style);
        fs.writeFileSync(getPath(uniquePath, "config.json"), config);

        ctx.body = {
          status: 200,
          message: "上传成功！",
        };
      } catch (e) {
        ctx.body = {
          status: 500,
          message: "服务器内部错误！",
        };
      }
    }
  } else {
    ctx.body = {
      status: 404,
      message: "没有该用户！",
    };
  }
});

router.post("/delete_widget", async (ctx) => {
  const { token, name } = ctx.request.body;
  const { username } = await vertifyToken(token, ctx);

  const findUser = async () => {
    const user = await User.find({ username });
    if (user.length > 0) return user;
    return [];
  };

  const user = await findUser();

  if (user.length > 0) {
    try {
      const getDelDirName = (removeName) => {
        const widgetsPath = path.join(__dirname, "../public/widgets");
        const dirs = fs.readdirSync(widgetsPath);
        let result = null;

        const isInFiles = (name, files) => {
          return (
            files.findIndex((file) => {
              const [type] = file.split(".");
              return type === name;
            }) !== -1
          );
        };

        dirs.forEach((dir) => {
          const dirPath = path.join(widgetsPath, dir);
          const files = fs.readdirSync(dirPath);

          if (isInFiles(removeName, files)) {
            result = dirPath;
          }
        });

        return result;
      };

      const deleteDirName = getDelDirName(name);
      const deleteDirPath = path.join(deleteDirName);
      deleteFolder(deleteDirPath);

      ctx.body = {
        status: 200,
        message: "删除成功！",
      };
    } catch (e) {
      console.log(e);
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

router.get("/get_widgets", async (ctx) => {
  const { token } = ctx.query;
  const { username } = await vertifyToken(token, ctx);

  const findUser = async () => {
    const user = await User.find({ username });
    if (user.length > 0) return user;
    return [];
  };

  const user = await findUser();
  if (user.length > 0) {
    const components = [];

    const widgetsPath = path.join(__dirname, `../public/widgets`);
    const dirs = fs.readdirSync(widgetsPath);

    dirs.forEach((widget) => {
      const widgetPath = path.join(widgetsPath, widget);
      const files = fs.readdirSync(widgetPath);

      const component = {};

      files.forEach((file) => {
        const filePath = path.join(widgetPath, file);
        const fileArr = filePath.split("\\");

        const length = fileArr.length;
        const remainder = fileArr.slice(length - 3, length).join("/");
        const pathInServer = SERVER_URL + "/" + remainder;

        const name = file.split(".")[0];

        switch (name) {
          case "config":
            component.config = pathInServer;
            break;
          case "style":
            component.style = pathInServer;
            break;
          default:
            component.component = pathInServer;
            break;
        }
      });

      const getProps = () => {
        const configPath = path.join(widgetPath, "config.json");
        const props = fs.readFileSync(configPath);
        return JSON.parse(props);
      };
      const props = getProps();
      component.props = props;

      components.push(component);
    });
    
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

router.get("/", async (ctx) => {
  await ctx.render("index", {
    title: "ejs",
  });
});

module.exports = router;
