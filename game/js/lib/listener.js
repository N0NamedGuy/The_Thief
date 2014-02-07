define(["lib/util", "lib/underscore"], function (Util) {
    return function (cls) {
        cls.prototype.__listeners = {};

        cls.prototype.addEventListener = function (event, fun) {
            var lst = this.__listeners[event];

            if (lst === undefined) {
                lst = [];
            }
                
            lst.push(fun);
            this.__listeners[event] = lst;
        };

        cls.prototype.dispatchEvent = function (event, args, ctx) {
            _.each(this.__listeners[event], function (e) {
                e.call(ctx, event, args);
            });
        };

        cls.prototype.removeEventListener = function (event, fun) {
            this.__listeners[event] = _.some(this.__listeners[event], function (e) {
                return fun === e;
            });
        };;
    };
});
