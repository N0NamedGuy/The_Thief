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

        cls.prototype.dispatchEvent = function (event, args) {
            _.each(this.__listeners[event], function (e) {
                e(event, args);
            });
        };
    };
});
