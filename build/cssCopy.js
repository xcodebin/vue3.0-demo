let fs = require('fs')
const glob = require('glob')
let htmlList = glob.sync(`./src/modules/**/*.html`)
let cssList = glob.sync('./dist/css/*.css')
let moduleNames = htmlList.map(item => item.split('/')[3])
/**
 * css文件拷贝
 * @param src
 * @param dst
 */
let callbackFile = (src, dst) => {
  fs.readFile(src, 'utf8', (error, data) => {
    if (error) {
      // eslint-disable-next-line no-console
      console.log(error)
      return false
    }
    fs.writeFile(dst, data.toString(), 'utf8', (error) => {
      if (error) {
        // eslint-disable-next-line no-console
        console.log(error)
        PromiseRejectionEvent(error)
        return false
      }
      // console.log('CSS写入成功')
      fs.unlink(src, (err) => { // css删除成功
        fs.rmdir('./dist/css', (err) => {
        })
      })
    })
  })
}
// 复制目录
cssList.forEach((filepath, name) => {
  let fileNameList = filepath.split('.')
  let fileName = fileNameList[1].split('/')[3]// 多页面页面目录
  let copyName = filepath.split('/')[3]
  let curModuleNames = moduleNames.filter(item => fileName.includes(item) && item)
  let changeDirectorys = curModuleNames.length && curModuleNames.map(moduleName => `./dist/${moduleName}/css`) // 多页面JS文件地存放址
  if (!fileName.includes('chunk-vendors')) {
    changeDirectorys.forEach(path => {
      /* eslint-disable-next-line */
      fs.exists(path, function (exists) {
        if (exists) {
          // console.log(`${fileName}下CSS文件已经存在`)
          callbackFile(filepath, `${path}/${copyName}`)
        } else {
          fs.mkdir(path, function () {
            callbackFile(filepath, `${path}/${copyName}`)
            //   console.log(`${fileName}下CSS文件创建成功`)
          })
        }
      })
    })
  }
})