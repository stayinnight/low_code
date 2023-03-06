import React from 'react'
import { useSelector } from 'react-redux'

const BaseComponent = (props) => {

    const { widget } = props
    
    const getWidgetCenter = (store) => store.widgetCenter
    const widgetCenter = useSelector(getWidgetCenter)
    
    const findWidget = (widgetCenter, type) => {
        return widgetCenter.find((w) => {
            return w.config.type === type
        })
    }

    const component = findWidget(widgetCenter, widget.type)

    if(component){
        const Component = component.component
        return <Component config={widget}/>
    }else{
        return null
    }
}

export default BaseComponent