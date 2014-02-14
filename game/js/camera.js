define(["lib/util", "lib/underscore"], function (Util) {
    "use strict";
        
    var Camera = function (screen, shake, laziness, friction) {
        this.screen = screen;
        this.canvas = screen.getCanvas();
        this.lastx = this.x = 0;
        this.lasty = this.y = 0;

        this.shake = shake ? shake : 0;

        this.laziness = laziness ? laziness : 0;
        this.friction = friction ? friction : 0;
        
        this.scale = this.screen.scale;
    };

    Camera.prototype.setTarget = function (target) {
        this.target = target;
    }

    Camera.prototype.update = function (time) {
        var screen = this.screen;
        var canvas = this.canvas;
        var target = this.target;
        var shake = this.shake;
        var laziness = this.laziness;
        var friction = this.friction;

        var toFollow = {
            x: target ? target.x : this.x,
            y: target ? target.y : this.y
        };

        if (time) {
            toFollow.x += Math.sin(time) * shake;
            toFollow.y += Math.cos(time) * shake;
        }

        // Do the lazy and smooth camera
        // Thanks Aru!
        this.lastx = (this.lastx * laziness + toFollow.x) / friction;
        this.lasty = (this.lasty * laziness + toFollow.y) / friction;

        this.x = (canvas.width / 2) - this.lastx;
        this.y = (canvas.height / 2) - this.lasty;
        this.scale = this.screen.scale;
    };

    Camera.prototype.transform = function (ctx_) {
        var ctx = ctx_ ? ctx_ : this.fbCtx;
        ctx.translate(Math.floor(this.x), Math.floor(this.y));
    }

    Camera.prototype.getScreen = function () {
        return this.screen;
    }

    return Camera;
});
