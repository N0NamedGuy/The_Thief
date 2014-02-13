define(["lib/util", "lib/underscore"], function (Entity, Util) {
    "use strict";

    var onResize = function () {
        var w = this.width;
        var h = this.height;
        var scale = this.scale;

        var gameCanvas = this.gameCanvas;
        var framebuffer = this.framebuffer;

        return function (e) {
            var style = gameCanvas.style;

            /*
            framebuffer.width = gameCanvas.width = Math.min(w / scale,
                window.innerWidth / scale); 
            framebuffer.height = gameCanvas.height = Math.min(h / scale,
                window.innerHeight / scale); 

            style.left = ((window.innerWidth - 
                    (gameCanvas.width * scale)) / 2) + "px";

            */
            style.width = (gameCanvas.width * scale) + "px";
            style.height = (gameCanvas.height * scale) + "px";

            framebuffer.width = gameCanvas.width = window.innerWidth / scale;
            framebuffer.height = gameCanvas.height = window.innerHeight / scale;

            style.width = (gameCanvas.width * scale) + "px";
            style.height = (gameCanvas.height * scale) + "px";
        };
    };

    var Screen = function (container, width, height, scale) {
        this.framebuffer = document.createElement("canvas");
        this.gameCanvas = document.createElement("canvas");

        this.fbCtx = this.framebuffer.getContext("2d");
        this.gameCtx = this.gameCanvas.getContext("2d");

        this.fbCtx.imageSmoothingEnable = false;
        this.gameCtx.imageSmoothingEnable = false;

        this.width = width;
        this.height = height;

        this.scale = scale;
        
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
