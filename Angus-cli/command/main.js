const { program } = require('commander')
const { version, commandMap } = require('../utils/util')

program.version(version)

Reflect.ownKeys(commandMap).forEach(action => {
    program
    .command(action)
    .alias(commandMap[action].alias)
    .description(commandMap[action].description)
    .action(()=>{
        if(action === '*'){
            console.log(commandMap[action].description)
        }
        const argv = process.argv
        if(argv.length > 4){
            console.log('command format error !')
        }
        const [_, __, o, params] = argv
        const exe = require(`./${o}`)
        exe(params)
    })
})


program.parse(process.argv)