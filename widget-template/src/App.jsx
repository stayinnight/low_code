import Widget from "./widget/widget";
import config from "./widget/config.json";

window.widgetCenter = window.widgetCenter ? window.widgetCenter : []

const widget = {
  component: Widget,
  config: config
}

const init = () => {
  const temp = [...window.widgetCenter]
  temp.push(widget) 
  window.widgetCenter = temp
}

init()
