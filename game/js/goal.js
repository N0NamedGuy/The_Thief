define(["lib/util", "entity", "lib/underscore"], function (Util, Entity) {
    "use strict";

    var Goal = function(entity, map, entities) {
        console.log("Goal Object", entity);
        Entity.call(this, entity, map, entities);
        console.log("Goal Entity", this);
        this.properties.closedgid = this.gid;
        console.log(this.properties);
        this.isOpen = false;
    };

    Goal.prototype = Object.create(Entity.prototype);

    Goal.prototype.reset = function () {
        this.isOpen = false;
        this.visible = true;
        this.gid = this.properties.closedgid;
        this._reset();
    };

    Goal.prototype.open = function (player) {
        if (this.isOpen) return;
        this.visible = false;
        this.gid = this.opengid;
        player.goals++;
        this.isOpen = true;

        this.dispatchEvent("open");
    };

    return Goal;
});
