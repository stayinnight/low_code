import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import request from "../api";
import BaseComponent from "../components/common/BaseComponent";
import { ActionTypes } from "../store/reducers";
import Wrap from "../components/common/Wrap";
import './style.css'

const IndexPage = (props) => {
  const { userId } = props.match.params;

  const [loading, setLoading] = useState(true);

  const getCurrComponentData = (store) => store.currComponnetData;
  const currComponnetData = useSelector(getCurrComponentData);

  const dispatch = useDispatch();

  const initPages = () => {
    request.get("data/get_pages_byid", { userId }).then((res) => {
      const componentData = res.data.data.pages[0].componentData;
      const pages = res.data.data.pages;
      dispatch({
        type: ActionTypes.changeComponentData,
        payload: componentData,
      });
      dispatch({
        type: ActionTypes.initPages,
        payload: pages,
      });
      setLoading(false)
    });
  };

  useEffect(() => {
    request.get("data/get_widgets_byid", { userId }).then((result) => {
      const components = result.data.data.components;

      components.forEach(async (item, index) => {
        const { component: c, style: s } = item;
        const script = document.createElement("script");
        const link = document.createElement("link");

        script.src = c;
        link.href = s;
        link.rel = "stylesheet";

        document.body.appendChild(script);
        document.head.appendChild(link);

        script.onload = () => {
          dispatch({
            type: ActionTypes.initWidgets,
            payload: window.widgetCenter,
          });
          if (index === components.length - 1) {
            initPages();
          }
        };
      });
    });
  }, [userId]);

  return (
    <div>
      {loading ? (
        <div className="loading">loading...</div>
      ) : (
        <div>
          {currComponnetData.map((widget, index) => {
            return (
              <Wrap key={index} widget={widget}>
                <BaseComponent widget={widget} />;
              </Wrap>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default IndexPage;
