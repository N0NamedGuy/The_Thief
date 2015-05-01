define(["../underscore/underscore"], function util() {
    "use strict";

    /**
     * Helper variable for {@link $_.getTime}
     * @private
     */
    var startTime = new Date().getTime();

    /**
     * Utility functions module.
     *
     * @author David Serrano <david.ma.serrano@gmail.com>
     * @exports $_
     */
    var $_ = function (id) {
        return $_.select(id);
    };

    /**
     * Selects an HTMLElement from the DOM by it's id.
     * It is essentially a shorthand for <code>document.getEleemntById</code>.
     * Can be aliased with <code>$_(id)</code>.
     *
     * @param id {String} The id of the HTML elemment.
     * @return {HTMLElement} The selected HTML element.
     */
    $_.select = function (id) {
        if (id) {
            return document.getElementById(id);
        } else {
            return undefined;
        }
    }

    /**
     * Callback for when an AJAX request is made sucessfully
     *
     * @callback $_~AJAXCallback
     * @param data {String} The returned data.
     */
    
    /**
     * Fuction to easily make an AJAX request.
     *  
     * @param {String} req request URL.
     * @param {$_~AJAXCallback} callback Function that is caled when AJAX data
     *          is received.
     * @param ctx The object to which the callback function will be bound to.
     */
    $_.getAJAX = function(req, callback, ctx) {
        var xhr = new XMLHttpRequest();
        //xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange = function () {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    var ret = xhr.responseText;
                    $_.callback(callback, ctx, [ret]);
                }
            }
        };
        
        xhr.open("GET", req, true);
        xhr.send(null);
    };

    /**
     * Callback for when an JSON AJAX request is made sucessfully
     *
     * @callback $_~JSONCallback
     * @param data {Object} The returned JSON data.
     */

    /**
     * Function to easy make an AJAX request, that returns JSON data.
     *
     * @param {String} req request URL.
     * @param {$_~JSONCallback} callback Function that is caled when JSON AJAX
     *          data is received.
     */
    $_.getJSON = function(req, callback, ctx) {
        this.getAJAX(req, function (data) {
            $_.callback(callback, ctx, [JSON.parse(data)]);
        });
    };

    /**
     * Called when a resource needs loading.
     *
     * @callback $_~AsynchLoader
     * @param {any} path "Path" or other data relevante for the loader to load
     *      a resource.
     */

    /**
     * Called when all resources are loaded.
     *
     * @callback $_~AsynchLoaded
     * @param {Array} resources All resources that have been loaded.
     */

    /**
     * Loads an arbitrary amount of resources asynchronously. 
     *
     * @param {Array} paths - Path array to the resources.
     * @param {$_~AsynchLoader} loader - A loader function to load a path.
     * @param {$_~AsynchLoaded} callback - When everything is loaded, this callback is called.
     * @param {Object} ctx - Context object bound to loader and callback functions
     *                       (in other words, the "this" variable).
     */

    $_.loadAsynch = function (paths, loader, callback, ctx) {
        var remaining = paths.length;

        var loadedFun = function () {
            remaining--;
            if (remaining === 0) {
                $_.callback(callback, ctx, [res]);
            }
        };

        var res = _.map(paths, function(path) {
            return loader.call(ctx, path, loadedFun);
        });
    };

    /**
     * Runs multiple functions "in parallel".
     *
     * @param {Array.<$_~AsynchLoader>} funs - An array of functions with one argument
     *      that should be called when the function's task is done.
     * @param {$_~AsynchLoaded} cb - Called when all functions are done.
     * @param {Object} ctx - Object bound to the callback function.
     *
     * @return {Array.<Any>} an array containing all functions return values (if any).
     */
    $_.runParallel = function (funs, cb, ctx) {
        return $_.loadAsynch(funs, function (fun, loadedFun) {
            return fun(loadedFun);
        }, cb, ctx);
    };

    // From: http://stackoverflow.com/a/901144
    /**
     * Gets a parameter from the URL's query string.
     *
     * @param {String} name The parameter's name.
     * @return {String} The parameter's value.
     */
    $_.getParameterByName = function (name) {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    };

    /**
     * Gets how many ticks (or miliseconds) have passed since this script
     * started running.
     *
     * @return {number} Miliseconds passed since this script started runnig.
     */
    $_.getTicks = function () {
        var now = new Date().getTime();
        return now - startTime;
    };

    /**
     * Transforms an array of tuples into an object.
     * The first value of each tuple represents the key, the second is the value.
     *
     * @example
     * $_.makeMap([["a": 1], ["b": 2]]) === {a: 1, b: 2}
     *
     * @param {Array.<Array>} The array of tuples.
     * @returns {object} The object created from the array of pairs/tuples.
     */
    $_.makeMap = function (arr) {
        return _.reduceRight(arr, function (obj, pair) {
            obj[pair[0]] = pair[1]; 
            return obj;
        }, {});
    };

    /**
     * An object that repsents a x,y coordinate.
     *
     * @typedef {object} Coordinate
     * @property {number} x X coordinate.
     * @property {number} y X coordinate.
     */

    /**
     * Given an width, converts an index to (X,Y) coordinates from a grid.
     *
     * @param {number} index The point/square index.
     * @param {number} width The grid width.
     * @returns {Coordinate} The point/square coordinates.
     */
    $_.toXY = function (index, width) {
        return {
            x: index % width,
            y: Math.floor(index / width)
        };
    };

    /**
     * Given (x,y) coordinates, calculates the grid index of a square.
     *
     * @param {number} x The X coordinate.
     * @param {number} y The Y coordinate.
     * @param {number} tw The tile/square width.
     * @param {number} th The tile/square height.
     * @param {number} width The grid's width.
     * @returns {number} The square's index.
     */
    $_.fromXY = function (x, y, tw, th, width) {
        return (Math.floor(y / th) * width) + Math.floor(x / tw);
    };

    /**
     * Binds an event handler function to a context.
     *
     * @example
     * var obj = {
     *    triggered: false,
     *    test: function () {
     *        document.addEventListener("click",
     *            $_.decorateEvent(this, function () {
     *                // this.triggered is obj.triggered
     *                this.triggered = true;
     *            })
     *        );
     *    }
     * }
     *
     * @param {object} ctx The object to bind the function to.
     * @param {function} fun The handler function.
     * @return {function(nsIDOMEvent)} A function to be passed to an
     *      event handler.
     */
    $_.decorateEvent = function (ctx, fun) {
        return function onEv(ev) {
            fun.call(ctx, ev);
        }
    };

    /**
     * Function to facilitate bound callbacks.
     *
     * @param {function} fun The function to call.
     * @param {object} ctx The object to which the function will be bound.
     * @param {Array.<object>} args The arguments that are passed to the function.
     */
    $_.callback = function (fun, ctx, args) {
        if (fun && fun.call) {
            fun.apply(ctx, args);
        }
    }

    if (window.requestAnimationFrame) {
        $_.nextFrame = function (fun, ctx) {
            window.requestAnimationFrame(function () {
                fun.call(ctx);
            });
        }
    } else {
        $_.nextFrame = function (fun, ctx) {
            window.setTimeout(function () {
                fun.call(ctx);
            }, 1000 / 60);
        }
    }

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
