const path = require('path')
const fs = require('fs')
const imageinfo = require('imageinfo')

let icons = []
const includeTypes = ['jpg', 'jpeg', 'png', 'gif']
const publicPath = '/CreativeProjects/Dashboard/'
const basic = 'images'
const dir = path.resolve(__dirname, '../', basic)

const getIconsList = function togGetIconsList (root, icons) {
    const files = fs.readdirSync(root)
    files.forEach(file => {
        const newPath = path.join(root, file)
        const fileStat = fs.statSync(newPath)
        // 判断是否是文件夹
        if (fileStat.isDirectory()) {
            // 文件夹类型则添加type属性为dir
            togGetIconsList(newPath, icons)
        } else {
            const type = path.extname(newPath).substring(1);
            if (includeTypes.includes(type)) {
                const data = fs.readFileSync(newPath)
                const info = imageinfo(data)
                const base = publicPath + basic + newPath.split(basic)[1].replace(/\\/g,"/")
                icons.push({
                    url: base,
                    sizes: `${info.width}×${info.height}`,
                    type: info.mimeType
                })
            }
        }
    })
}

getIconsList(dir, icons)
//将数组转换成字符串后写入data.txt文件中保存
fs.writeFileSync('./icons.txt', JSON.stringify({ icons }, null, '  '));
