define(function util() {
    var $_ = function (id) {
        return document.getElementById(id);
    }  

    /* From: http://stackoverflow.com/a/646643 */
    if (typeof String.prototype.startsWith != 'function') {
        // see below for better implementation!
        String.prototype.startsWith = function (str){
            return this.indexOf(str) == 0;
        };
    }

    return window.$_ = $_;
});
