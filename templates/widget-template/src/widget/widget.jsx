import React from "react";
import "./style.scss";

const Widget = ({ config }) => {
  const { style, propValue, title } = config;
  return (
    <button title={title} style={style} className="a-button">
      {propValue}
    </button>
  );
};
export default Widget;
