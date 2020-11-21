var fs = require('fs')
const glob = require('glob')
/**
 * JS文件拷贝
 * @param src
 * @param dst
 */
var callbackFile = function (src, dst) {
  fs.readFile(src, 'utf8', function (error, data) {
    if (error) {
      // eslint-disable-next-line no-console
      console.log(error)
      return false
    }
    fs.writeFile(dst, data.toString(), 'utf8', function (error) {
      if (error) {
        // eslint-disable-next-line no-console
        console.log(error)
        return false
      }
      // if (!dst.includes('.map')) callbackFile(dst, `${dst}.map`)
    })
  })
}
// 复制目录
glob.sync('./dist/js/*.js').forEach((filepath, name) => {
  let fileNameList = filepath.split('.')
  let fileName = fileNameList[1].split('/')[3]// 多页面页面目录
  let moduleNames = glob.sync(`./src/modules/**/*.html`).map(item => item.split('/')[3]).filter(item => fileName.includes(item) && item)
  let copyName = filepath.split('/')[3]
  let changeDirectorys = moduleNames.length && moduleNames.map(moduleName => `./dist/${moduleName}/js`) // 多页面JS文件地存放址
  if (!fileName.includes('chunk-vendors')) {
    changeDirectorys.forEach(path => {
      // eslint-disable-next-line
      fs.exists(path, function (exists) {
        if (exists) {
          // console.log(`${fileName}下JS文件已经存在`)
          callbackFile(filepath, `${path}/${copyName}`)
        } else {
          fs.mkdir(path, function () {
            callbackFile(filepath, `${path}/${copyName}`)
            // console.log(`${fileName}下JS文件创建成功`)
          })
        }
      })
    })
  }
})
