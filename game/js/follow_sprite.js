define(["sprite", "lib/underscore"], function (Sprite) {
    "use strict";

    var FollowSprite = function (img, target, offset) {
        Sprite.call(this, target.x + offset.x, target.y + offset.y);
    };

    FollowSprite.prototype = Object.create(Sprite.prototype);

    FollowSprite.prototype.update = function (ctx) {
        var target = this.target;
        var offset = this.offset;
        this.x = target.x + offset.x;
        this.y = target.y + offset.y;

    };

    return FollowSprite;
});
