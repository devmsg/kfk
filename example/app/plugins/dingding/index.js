const axios = require('axios');
const moment = require('moment');

module.exports = options => {
  think.hook.add('dingding', async (title, text) => {
    try {
      await axios({
        url: options.url,
        method: 'post',
        timeout: 3000,
        headers: {
          'Content-Type': 'application/json'
        },
        data: {
          msgtype: 'markdown',
          markdown: {
            title: title,
            text: `#### ${title} ####\n${text}\n#### 时间：${moment().format(
                            'YYYY-MM-DD HH:mm:ss'
                        )} ####`
          }
        }
      });
    } catch (error) {
      console.error('Ding Network fail');
    }
  });
};