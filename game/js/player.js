define(["entity", "lib/util", "lib/underscore"], function (Entity, Util) {
    "use strict";

    var Player = function (entity, map, entities_data) {
        Entity.call(this, entity, map, entities_data);
    };

    Player.prototype = Object.create(Entity.prototype);

    Player.prototype.reset = function () {
        this.goals = 0;
        this._reset();
    };

    return Player;
});
