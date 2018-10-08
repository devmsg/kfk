const glob = require("glob");
const path = require("path");
const Sequelize = require('sequelize');
const colors = require("colors")

module.exports = class Model {
  constructor(options = {}) {
    this.root = options.root || process.env.APP_ROOT;
    this.models = {};
    this.Sequelize = Sequelize;
    const config = {
      database: process.env.DATABASE,
      username: process.env.USERNAME,
      password: process.env.PASSWORD,
      dialect: process.env.DIALECT,
      host: process.env.HOST,
      port: process.env.PORT,
      benchmark: true,
      define: {
        freezeTableName: false,
        underscored: true,
      },
      logging: false,
      pool: {
        max: 5,
        min: 0,
        idle: 10000
      },
    }
    this.sequelize = new Sequelize(config.database, config.username, config.password, config);
    this.app = {
      Sequelize,
      model: this.sequelize,
    }
    this.sequelize.authenticate().then(async () => {
      console.log('sequelize：数据库连接成功');
    }).catch(function (err) {
      console.log('sequelize：数据库连接失败 %s'.red, err);
    });
  }

  loadModels() {
    const rootModels = glob.sync('model/*.js', {
      cwd: this.root
    });
    for (const rootmodel of rootModels) {
      const paths = path.parse(rootmodel);
      const models = require(path.resolve(this.root, rootmodel));
      this.models[paths.name] = models(this.app);
    }
    return this.models;
  }
}