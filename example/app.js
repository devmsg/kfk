const Application = require('../lib/application');
const app = new Application();

app.plugin('dingding', {
  url: 'https://oapi.dingtalk.com/robot/send?access_token=3f642ca3e91902ad06efdb3c14ffb2897fbe904c8b205bc0caa9206d675e51e4'
})
app.start();

app.hook.run('dingding', '系统提示', '应用启动成功')
