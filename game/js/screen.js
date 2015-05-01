define(["lib/util", "underscore/underscore"], function (Entity, Util) {
    "use strict";

    var SCREEN_SCALE_SMALL = 1;
    var SCREEN_SCALE_BIG = 2;
    var SCREEN_SCALE = 2;

    var SCREEN_SMALL = 480;

    var onResize = function () {
        var w = this.width;
        var h = this.height;
        var scale = this.scale;

        var gameCanvas = this.gameCanvas;
        var framebuffer = this.framebuffer;

        var screen = this;

        return function (e) {
            var style = gameCanvas.style;
            var iw = window.innerWidth;
            var ih = window.innerHeight;

            var myScale = screen.scale = iw > SCREEN_SMALL && ih > SCREEN_SMALL ?
                scale : SCREEN_SCALE_SMALL;

            style.width = (gameCanvas.width * myScale) + "px";
            style.height = (gameCanvas.height * myScale) + "px";

            screen.width = framebuffer.width =
                gameCanvas.width = iw / myScale;
            
            screen.height = framebuffer.height =
                gameCanvas.height = ih / myScale;

            style.width = (gameCanvas.width * myScale) + "px";
            style.height = (gameCanvas.height * myScale) + "px";
        };
    };

    var Screen = function (container) {
        this.framebuffer = document.createElement("canvas");
        this.gameCanvas = document.createElement("canvas");

        this.fbCtx = this.framebuffer.getContext("2d");
        this.gameCtx = this.gameCanvas.getContext("2d");

        this.fbCtx.imageSmoothingEnabled = false;
        this.gameCtx.imageSmoothingEnabled = false;

        this.scale = SCREEN_SCALE_BIG;
        
        container.appendChild(this.gameCanvas);
        window.addEventListener("resize", onResize.call(this), true);
        onResize.call(this)();
    };

    Screen.prototype.flip = function () {
        this.gameCtx.drawImage(this.framebuffer, 0, 0);
    }

    Screen.prototype.getCanvas = function () {
        return this.gameCanvas;
    }

    Screen.prototype.getCtx = function () {
        return this.gameCtx;
    }

    return Screen;
});
