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
        var w2 = this.width / 2;
        var h2 = this.height / 2;

        console.log("Sprite pos:", this.x - w2, this.y - h2, img);
        // FIXME: draw image correctly (if stretched, it should be drawn stretched)
        ctx.drawImage(this.img,
            Math.floor(this.x - w2), Math.floor(this.y - h2));
    };

    return Sprite;
});
