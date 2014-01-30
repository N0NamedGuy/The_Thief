define(["sprite", "lib/underscore"], function (Sprite) {
    "use strict";

    var FollowSprite = function (img, target, offset) {
        Sprite.call(this, img, target.x + offset.x, target.y + offset.y);
        this.target = target;
        this.offset = offset;
    };

    FollowSprite.prototype = Object.create(Sprite.prototype);

    FollowSprite.prototype.update = function () {
        var target = this.target;
        var offset = this.offset;
        this.x = target.x + offset.x;
        this.y = target.y + offset.y;
    };

    return FollowSprite;
});
