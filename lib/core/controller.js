const _ = require('lodash');

module.exports = class Controller {
    constructor(ctx, next) {
        this.ctx = ctx;
        this.next = next;

        for (const name in ctx) {
            if (this[name]) {
                console.warn(
                    `SyntaxTips: Using 'this.koa.${name}()' To Call Koa ${_.capitalize(
                        name
                    )} Api`
                );
                continue;
            }

            if (typeof ctx[name] !== 'function') {
                Object.defineProperty(this, name, {
                    get: () => {
                        return this.ctx[name];
                    },
                    set: value => {
                        this.ctx[name] = value;
                    }
                });
            } else {
                this[name] = ctx[name];
            }
        }
    }
};