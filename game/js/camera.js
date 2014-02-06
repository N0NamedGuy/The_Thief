define(["lib/util", "lib/underscore"], function (Util) {
    "use strict";
        
    var onResize = function () {
        var w = this.width;
        var h = this.height;
        var scale = this.scale;

        var gameCanvas = this.gameCanvas;
        var framebuffer = this.framebuffer;

        return function (e) {
            var style = gameCanvas.style;

            framebuffer.width = gameCanvas.width = Math.min(w / scale,
                window.innerWidth / scale); 
            framebuffer.height = gameCanvas.height = Math.min(h / scale,
                window.innerHeight / scale); 

            style.left = ((window.innerWidth - 
                    (gameCanvas.width * scale)) / 2) + "px";

            style.width = (gameCanvas.width * scale) + "px";
            style.height = (gameCanvas.height * scale) + "px";
        };
    };

    var Camera = function (container, width, height, scale, shake, laziness, friction) {
        this.framebuffer = document.createElement("canvas");
        this.gameCanvas = document.createElement("canvas");

        this.fbCtx = this.framebuffer.getContext("2d");
        this.gameCtx = this.gameCanvas.getContext("2d");

        this.fbCtx.imageSmoothingEnable = false;
        this.gameCtx.imageSmoothingEnable = false;

        this.width = width;
        this.height = height;

        this.scale = scale;
        this.lastx = this.x = 0;
        this.lasty = this.y = 0;

        this.shake = shake ? shake : 0;

        this.laziness = laziness ? laziness : 0;
        this.friction = friction ? friction : 0;

        container.appendChild(this.gameCanvas);

        window.addEventListener("resize", onResize.call(this), true);
        onResize.call(this)();
    };

    Camera.prototype.setTarget = function (target) {
        this.target = target;
    }

    Camera.prototype.update = function (time) {
        var canvas = this.gameCanvas;
        var target = this.target;
        var shake = this.shake;
        var laziness = this.laziness;
        var friction = this.friction;

        var toFollow = {
            x: target ? target.x : this.x,
            y: target ? target.y : this.y
        };

        // Do the lazy and smooth camera
        // Thanks Aru!
        this.lastx = (this.lastx * laziness + toFollow.x) / friction;
        this.lasty = (this.lasty * laziness + toFollow.y) / friction;

        if (time) {
            toFollow.x += Math.sin(time) * shake;
            toFollow.y += Math.cos(time) * shake;
        }

        this.x = (canvas.width / 2) - this.lastx;
        this.y = (canvas.height / 2) - this.lasty;
    };

    Camera.prototype.transform = function (ctx_) {
        var ctx = ctx_ ? ctx_ : this.fbCtx;
        ctx.translate(Math.floor(this.x), Math.floor(this.y));
    }

    Camera.prototype.flip = function () {
        this.gameCtx.drawImage(this.framebuffer, 0, 0);
    }

    Camera.prototype.getCanvas = function () {
        return this.gameCanvas;
    }

    Camera.prototype.getCtx = function () {
        return this.gameCtx;
    }

    return Camera;
});
