const { version } = require('../package.json')
const schema = require('./schema.json')
const Ajv = require('ajv')
const ajv = new Ajv()

const commandMap = {
    create: {
        alias: 'c',
        description: 'create a new project !'
    },
    publish: {
        alias: 'p',
        description: 'publish the project to server !'
    },
    remove: {
      alias: 'r',
      description: 'remove this type of component !'  
    },
    "*": {
        alias: '',
        description: 'command not found !'
    }
}

const vaild = (config) =>{
    ajv.addKeyword("allowUnionTypes")
    ajv.addKeyword("strict")
    const isVaild = ajv.validate(schema, config)
    if(!isVaild){
        console.log(ajv.errors[0].message)
    }
    return isVaild
}

const FileTypes = {
    js: 'widget.umd.js',
    css: 'style.css',
    config: 'config.json'
}

module.exports = {
    version,
    commandMap,
    vaild,
    FileTypes
}