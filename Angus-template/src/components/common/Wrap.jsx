import { useMemo, useState } from "react";
import { animatePrefix, eventTypes } from "../../config/index.js";
import { useDispatch, useSelector } from "react-redux";
import { message } from "antd";
import { withRouter } from "react-router-dom";
import { ActionTypes } from "../../store/reducers.js";

const PreviewWrap = ({ widget, children, history }) => {
  const dispatch = useDispatch();
  const getPages = (store) => store.pages;
  const pages = useSelector(getPages);

  const findPageByUrl = (url, pages) => {
    return pages.find((page) => {
      return page.pageUrl === url;
    }).componentData
  };

  /*保存事件类型对应的回调函数*/
  const eventPool = {
    [eventTypes.message]: (msg) => {
      message.warn(msg);
    },
    [eventTypes.redirect]: (url) => {
      if (url.startsWith("/")) {
        const componentData = findPageByUrl(url, pages);
        dispatch({
          type: ActionTypes.changeComponentData,
          payload: componentData,
        });
      } else {
        window.location.href = url;
      }
    },
  };

  const { style, event, animation } = widget;

  const handleClick = () => {
    event.forEach((e) => {
      const params = e.params;
      if (params) {
        eventPool[e.type](params);
      }
    });
  };

  const position = {
    left: style.left,
    top: style.top,
    position: "absolute",
  };

  const defaultClass = useMemo(
    () => "preview-wrap" + " " + animatePrefix + " " + animation[0],
    [animation]
  );

  const [currAnimatioin, setCurrAnimation] = useState(defaultClass);
  const [currIndex, setCurrIndex] = useState(1);

  const handleAnimatioinEnd = () => {
    setCurrIndex((i) => {
      setCurrAnimation((curr) => curr + " " + animation[currIndex]);
      return i + 1;
    });
  };

  return (
    <div
      onClick={handleClick}
      style={position}
      className={currAnimatioin}
      onAnimationEnd={handleAnimatioinEnd}
    >
      {children}
    </div>
  );
};
export default withRouter(PreviewWrap);
