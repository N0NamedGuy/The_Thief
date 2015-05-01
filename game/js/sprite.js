define(["underscore/underscore"], function () {
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
        var w2 = this.width / 2;
        var h2 = this.height / 2;

        ctx.drawImage(img,
            0, 0,
            img.width, img.height,
            Math.floor(this.x - w2), Math.floor(this.y - h2),
            Math.floor(this.width), Math.floor(this.height));
    };

    return Sprite;
});
