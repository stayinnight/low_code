export const ActionTypes = {
  initWidgets: "INIT_WIDGETS",
  changeComponentData: 'CHANGE_COMPONNETDATA',
  initPages: 'INIT_PAGES'
};

const initState = {
  widgetCenter: [],
  currComponnetData: [],
  pages: []
};

export const reducer = (state = initState, action) => {
  switch (action.type) {
    case ActionTypes.initWidgets:
      const newWidgetCenter = { ...state };
      newWidgetCenter.widgetCenter = action.payload
      return newWidgetCenter
    case ActionTypes.changeComponentData:
      const newCurrComponnet = { ...state };
      newCurrComponnet.currComponnetData = action.payload
      return newCurrComponnet
    case ActionTypes.initPages:
      const newPages = { ...state };
      newPages.pages = action.payload
      return newPages
    default:
      return initState
  }
};
