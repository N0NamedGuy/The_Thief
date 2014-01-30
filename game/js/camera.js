define(function (Util) {
    "use strict";

    var Camera = function (canvas, target, shake, laziness, friction) {
        this.canvas = canvas;

        this.lastx = this.x = target && target.x ? target.x : 0;
        this.lasty = this.y = target && target.y ? target.y : 0;

        this.target = target;
        this.shake = shake ? shake : 0;

        this.laziness = laziness ? laziness : 0;
        this.friction = friction ? friction : 0;
    };

    Camera.prototype.update = function (time) {
        var canvas = this.canvas;
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

    Camera.prototype.transform = function (ctx) {
        ctx.translate(Math.floor(this.x), Math.floor(this.y));
    }

    return Camera;
});
