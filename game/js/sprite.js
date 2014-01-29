define(["lib/underscore"], function () {
    "use strict";

    var Sprite = function (img, x, y, h, w) {
        this.visible = false;
        this.img = img;

        this.x = x;
        this.y = y;

        this.h = h;
        this.w = w;
    };

    Sprite.prototype.draw = function (ctx) {
        if (!this.visible) return;

        var img = this.img;
        ctx.draw(this.img, Math.floor(object.x), Math.floor(object.y),
            Math.floor(this.w), Math.floor(this.h));
    }

    return Sprite;
});
