define(["lib/underscore"], function () {
    "use strict";

    var Sprite = function (img, x, y, h, w) {
        this.visible = false;
        this.img = img;

        this.x = x ? x : 0;
        this.y = y ? y : 0;

        this.height = h ? h : img.height;
        this.width = w ? w : img.width;
    };

    Sprite.prototype.draw = function (ctx) {
        if (!this.visible) return;

        var img = this.img;
        ctx.draw(this.img,
            0, 0,
            img.width, img.height,
            Math.floor(this.x), Math.floor(this.y),
            Math.floor(this.w), Math.floor(this.h));
    }

    return Sprite;
});
