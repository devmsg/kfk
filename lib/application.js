const Koa = require('koa');
const dotenv = require('dotenv');
const glob = require('glob');
const path = require('path');
const _ = require('lodash');
const logger = require('koa-logger');
const body = require('koa-body');
const context = require('./context');
const Router = require('./core/router');
const Controller = require('./core/controller');
const Hook = require('./core/hook');
const Model = require('./core/model');

/**
 *  Todo: 
 *        view层
 *        同构解决方案
 * 
 */
global.think = {};

dotenv.config({
  path: path.resolve(__dirname, '..', '.env')
});

class Application extends Koa {
  constructor(options = {}) {
    super(options)
    think = Object.assign(this, {});
    Object.assign(think, context);
    this.root = options.root || process.env.APP_ROOT;
    this.useBody = false;
    this.useCore = false;
    this.options = options;
    this.model = {};
    this.use(async (ctx, next) => {
      const start = Date.now();
      await next();
      ctx.set('X-Powered-By', 'Think');
      ctx.set('X-Response-Time', `${Date.now() - start}ms`);
    });
    this.use(logger());
  }

  core() {
    this.useCore = true;
    // model
    const model = new Model(this.options);
    this.models = model.loadModels();

    // hook
    this.hook = new Hook(this.options);

    // router
    this.Controller = Controller;
    this.router = new Router(
      Object.assign(this.options, {
        router: this.options.router
      })
    ).loadRouters();
  }

  plugin(plugin, options) {
    if (!this.useCore) {
      this.core();
    }

    if (_.isString(plugin)) { 
      const plgs = glob.sync(`plugins/${plugin}/*.js`, {
        cwd: this.root
      });
      for (const key in plgs) {
        require(path.resolve(this.root, plgs[key]))(options);
      }
    }
  
    if (_.isFunction(plugin)) {
      plugin(options);
    }
  }

  body() {
    this.useBody = true;
    this.use(async (ctx, next) => {
      await body({
        multipart: true
      })(ctx, async () => {
        if (!ctx.request.body.files) {
          ctx.post = ctx.request.body;
        } else {
          ctx.post = ctx.request.body.fields;
          ctx.file = ctx.request.body.files;
        }
      });

      await next();
    });
  }

  async start() {
    if (!this.useBody) {
      this.body();
    }

    if (!this.useCore) {
      this.core();
    }
    this.RequestMapping = this.requestMapping;
    this.use(this.router.routes());
    this.use(this.router.allowedMethods());
    Object.assign(this.context, think);

    this.listen(process.env.APP_PORT, this.startLogger);
  }

  async startLogger() {
    console.log(`Listen Port: ${process.env.APP_PORT}`);
    console.log(`Nodejs Version: ${process.version}`);
  }
}

module.exports = Application;