define(["lib/util", "lib/underscore"], function (Util) {
    "use strict";
    var Entity = function (entity, map, ent_data) {
        this.map = map;
        this.entity = entity;

        this.width = entity.width;
        this.height = entity.height;
        
        this.oldx = entity.x + this.width;
        this.oldy = entity.y - this.height;

        this.start = {
            x: this.oldx,
            y: this.oldy
            speed: 0
        };
        this.target = undefined;
        this.wallHit = false;
        this.properties = entity.properties;

        this.poses = ent_data ? ent_data.poses : {};
        this.sounds = ent_data ? ent_data.sounds : {};

        this.reset();
    };

    Entity.prototype.reset = function () {
        this.x = this.start.x;
        this.y = this.start.y;
        this.target = undefined;
        this.wallHit = false;
        this.alerted = undefined;

        if (this.properties.speed) {
            this.start.speed = this.speed = this.properties.speed;
        } else {
            this.start.speed = this.speed = 0;
        }

        this.anim = {
            frame: 0,
            pose: "idle"
        };
    }

    Entity.prototype.update = function (dt) {
        if (this.target === undefined) return;

        var speed = this.speed;
        var tx = this.target.x;
        var ty = this.target.y;
        
        var angle = Math.atan2(ty - this.y, tx - this.x);

        var nx = this.x + speed * Math.cos(angle) * dt;
        var ny = this.y + speed * Math.sin(angle) * dt;

        this.wallHit = !this.moveTo(nx, ny);

        var sdt = speed * dt;

        // We sort of reached our destination!
        if ((
            this.x > (tx - sdt) && this.x < (tx + sdt) &&
            this.y > (ty - sdt) && this.y < (ty + sdt)
        )) {
           this.target = undefined;
        }

        // Deal with steps
        var diffx = Math.abs(this.x - this.oldx);
        var diffy = Math.abs(this.y - this.oldy);
        if ((diffx * diffx) + (diffy * diffy) > 10 * 10) {
            this.oldx = this.x;
            this.oldy = this.y;
            this.anim.frame++;

            var step_sound = entity.sounds ? entity.sounds.step : undefined;
            // Deal with this later
            //if (step_sound) playAudio(step_sound);
        } 
    }

    Entity.prototype.moveTo = function (x, y, bgLayer) {
        var map = this.map;

        var props = map.getTileProps(bgLayer, this.x, y);
        if (props && props.walkable === "true") this.y = y;

        props = map.getTileProps(bgLayer, x, this.y);
        if (props && props.walkable === "true") this.x = x;

        props = map.getTileProps(bgLayer, x, y);
        this.anim.pose = "walking";

        return props && props.walkable === "true";
    }

    Entity.prototype.moveRelative = function (x, y) {
        var properties;
        var speed = 1.0;
        
        properties = this.properties;
        if (properties && properties.speed) {
            speed = properties.speed;
        }
        this.setTarget(this.x + (x * speed), this.y + (y * speed));
    };

    Entity.prototype.setTarget = function (x, y) {
        this.target = {x: x, y: y};
    }

    return Entity; 
});
