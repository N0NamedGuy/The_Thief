define(function util() {
    "use strict";
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
            console.log(xhr);
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

    $_.getJSON = function(req, callback) {
        this.getAJAX(req, function (data) {
            if (typeof callback === "function") {
                if (req !== undefined) {
                    callback(JSON.parse(data));
                } else {
                    callback(data);
                }
            }
        });
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
