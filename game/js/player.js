define(["entity", "lib/util", "underscore/underscore"], function (Entity, Util) {
    "use strict";

    var Player = function (entity, map, entities_data) {
        Entity.call(this, entity, map, entities_data);
    };

    Player.prototype = Object.create(Entity.prototype);

    Player.prototype.reset = function () {
        this.goals = 0;
        return Entity.prototype.reset.call(this);
    };

    return Player;
});
