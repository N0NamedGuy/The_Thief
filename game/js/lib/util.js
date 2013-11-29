define(["lib/underscore"], function util() {
    "use strict";

    var startTime = new Date().getTime();

    var $_ = function (id) {
        if (id) {
            return document.getElementById(id);
        } else {
            return undefined;
        }
    };

    $_.getAJAX = function(req, callback) {
        var xhr = new XMLHttpRequest();
        //xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange = function () {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    var ret = xhr.responseText;

                    if (typeof callback === "function") {
                        callback(ret);
                    } else {
                        callback(undefined);
                    }
                }
            }
        };
        
        xhr.open("GET", req, true);
        xhr.send(null);
    };

    $_.getJSON = function(req, callback, ctx) {
        this.getAJAX(req, function (data) {
            if (typeof callback === "function") {
                if (req !== undefined) {
                    callback(JSON.parse(data), ctx);
                } else {
                    callback(data, ctx);
                }
            }
        });
    };

    /** Loads an arbitrary amount of resources asynchronously. 
     * @param {Array} paths - Path array to the resources
     * @param {function} loader - A loader function to load a path
     * @param {function} callback - When everything is loaded, this callback is called */

    $_.loadAsynch = function (paths, loader, callback) {
        var remaining = paths.length;

        var loadedFun = function () {
            remaining--;
            if (remaining === 0 && typeof callback === "function") {
                callback(res);
            }
        };

        var res = _.map(paths, function(path) {
            return loader(path, loadedFun);
        });
    };

    /**
     * Runs multiple functions "in parallel".
     *
     * @param {function[]} funs - An arrays of functions with one argument
     * (which we'll call loadedFun) that should be called when the function's
     * task is done.
     *
     * @return an array containing all functions return values (if any)
     */
    $_.runParallel = function (funs, cb) {
        return $_.loadAsynch(funs, function (fun, loadedFun) {
            return fun(loadedFun);
        }, cb);
    };

    // From: http://stackoverflow.com/a/901144
    $_.getParameterByName = function (name) {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    };

    $_.getTicks = function () {
        var now = new Date().getTime();
        return now - startTime;
    };

    $_.makeMap = function (arr) {
        return _.reduceRight(arr, function (obj, pair) {
            obj[pair[0]] = pair[1]; 
            return obj;
        }, {});
    };

    $_.toXY = function (index, width) {
        return {
            x: index % width,
            y: Math.floor(index / width)
        };
    };

    $_.fromXY = function (x, y, th, tw, width) {
        return (Math.floor(y / th) * width) + Math.floor(x / tw);
    };

    $_.decorateEvent = function (ctx, fun) {
        return function onEv(ev) {
            fun.call(ctx, ev);
        }
    };

    /* From: http://stackoverflow.com/a/646643 */
    if (typeof String.prototype.startsWith != 'function') {
        // see below for better implementation!
        String.prototype.startsWith = function (str){
            return this.indexOf(str) === 0;
        };
    }

    window.$_ = $_;
    return $_;
});
