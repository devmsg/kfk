const path = require('path');
const glob = require('glob');
const _ = require('lodash');
const KoaRouter = require('koa-router');

class Router {
  constructor(options = {}) {
    this.root = options.root || process.env.APP_ROOT;
    this.router = options.router || new KoaRouter();
  }

  loadRouters() {
    // 以模块功能划分
    // const controllers = glob.sync('*/controller/**/*.js', {
    //   cwd: this.root
    // })
    // 传统方式 以 controller 层划分
    const controllers = glob.sync('controller/**/!(hook).js', {
      cwd: this.root
    });
    for (const controller of controllers) {
      const paths = path.parse(controller);
      const Ctrl = require(path.resolve(this.root, controller));
      const methods = Object.getOwnPropertyNames(Ctrl.prototype);
      const layers = [];
      for (const method of methods) {
        if (_.startsWith(method, '_') || method === 'constructor') {
          continue;
        }

        layers.push({
          method: method,
          callback: async (ctx, next) => {
            const ctrl = new Ctrl(ctx, next);
            const runMethods = [
              '_init',
              '_initialize',
              '_before',
              `_before_${method}`,
              method,
              `_after_${method}`,
              '_after'
            ];

            for (const method of runMethods) {
              if (_.includes(methods, method)) {
                await ctrl[method]();
              }

              if (ctx.status !== 404) {
                break;
              }
            }
          }
        });
      }
      for (const layer of layers) {
        const layerPath = path
          .join('/', paths.dir, paths.name, layer.method)
          .replace(/\\/g, '/')
          .replace(/\/controller/, '');
        this.router.all(layerPath, layer.callback);
      }
    }
    return this.router;
  }
}

module.exports = Router;