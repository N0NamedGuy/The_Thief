define(["sprite", "underscore/underscore"], function (Sprite) {
    "use strict";

    var FollowSprite = function (img, target, offset) {
        Sprite.call(this, img, target.x + offset.x, target.y + offset.y);
        this.target = target;
        this.offset = offset;
    };

    FollowSprite.prototype = Object.create(Sprite.prototype);

    FollowSprite.prototype.draw = function (ctx) {
        var target = this.target;
        var offset = this.offset;
        this.x = target.x + offset.x;
        this.y = target.y + offset.y;

        Sprite.prototype.draw.call(this, ctx);
    };

    return FollowSprite;
});
