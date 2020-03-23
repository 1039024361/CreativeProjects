const path = require('path')
const fs = require('fs')

const publicPath = '/CreativeProjects/Dashboard/'
const includeDirs = ['modules', 'utils', 'images']
const includeTypes = ['js', 'jpg', 'jpeg', 'png', 'gif', 'json']
let eFiles = []

const getEFilesList = function togGetEFilesList (root, eFiles, basic) {
    const files = fs.readdirSync(root)
    files.forEach(file => {
        const newPath = path.join(root, file)
        const fileStat = fs.statSync(newPath)
        // 判断是否是文件夹
        if (fileStat.isDirectory()) {
            // 文件夹类型则添加type属性为dir
            togGetEFilesList(newPath, eFiles, basic)
        } else {
            const type = path.extname(newPath).substring(1);
            if (includeTypes.includes(type)) {
                const base = publicPath + basic + newPath.split(basic)[1].replace(/\\/g,"/")
                eFiles.push(base)
            }
        }
    })
}

includeDirs.forEach(basic => {
    const dir = path.resolve(__dirname, '../', basic)
    getEFilesList(dir, eFiles, basic)
})
//将数组转换成字符串后写入data.txt文件中保存
fs.writeFileSync('./eFiles.txt', JSON.stringify({ eFiles }, null, '  '));
