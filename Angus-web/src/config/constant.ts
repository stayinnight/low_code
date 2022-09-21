/*我的github仓库链接地址*/
export const githubUrl: string = "https://github.com/wszcc/visual-construction"

/*最小的吸附距离*/
export const distance = 5

/*最小基准线允许的误差*/
export const near = 5

export const animatePrefix = 'animate__animated'

export const imageUrl = `
data:image/jpeg;base64,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
`