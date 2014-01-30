define(["sprite", 
        "lib/util",
        "lib/listener",
        "lib/underscore"],
        
        function (Sprite, Util, listener) {
    "use strict";

    var Entity = function (object, map, entities_data) {
        this.map = map;
        this.events = {};

        // Take all the values from the layer object */
        _.each(object, function (value, key) {
            this[key] = value;
        }, this);

        this.oldx = this.x + (this.width / 2);
        this.oldy = this.y - (this.height / 2);

        this.start = {
            x: this.oldx,
            y: this.oldy,
            speed: 0
        };
        this.target = undefined;
        this.wallHit = false;

        var ent_data = entities_data[this.type];
        this.poses = ent_data ? ent_data.poses : {};
        this.sounds = ent_data ? ent_data.sounds : {};

        this.reset();
    };

    Entity.prototype = Object.create(Sprite.prototype);

    listener(Entity);

    Entity.prototype.reset = function () {
        this.x = this.start.x;
        this.y = this.start.y;
        this.target = undefined;
        this.wallHit = false;

        if (this.properties.speed) {
            this.start.speed = this.speed = this.properties.speed;
        } else {
            this.start.speed = this.speed = 0;
        }

        this.anim = {
            frame: 0,
            pose: "idle"
        };
    };

    Entity.prototype.update = function (dt, bgLayer) {
        if (this.target === undefined) return;

        var speed = this.speed;
        var tx = this.target.x;
        var ty = this.target.y;
        
        var angle = Math.atan2(ty - this.y, tx - this.x);

        var nx = this.x + speed * Math.cos(angle) * dt;
        var ny = this.y + speed * Math.sin(angle) * dt;

        this.wallHit = !this.moveTo(nx, ny, bgLayer);

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

            var step_sound = this.sounds ? this.sounds.step : undefined;
            if (step_sound) this.dispatchEvent(step_sound);
        } 
    };

    Entity.prototype.moveTo = function (x, y, bgLayer) {
        var map = this.map;

        var props = bgLayer.getProperties(this.x, y);
        if (props && props.walkable === "true") this.y = y;

        props = bgLayer.getProperties(x, this.y);
        if (props && props.walkable === "true") this.x = x;

        props = bgLayer.getProperties(x, y);
        this.anim.pose = "walking";

        return props && props.walkable === "true";
    };

    Entity.prototype.moveRelative = function (x, y) {
        var properties;
        var speed = 1.0;

        if (x === y && x === 0) return;
        
        properties = this.properties;
        if (properties && properties.speed) {
            speed = properties.speed;
        }
        this.setTarget(this.x + (x * speed), this.y + (y * speed));
    };

    Entity.prototype.setTarget = function (x, y) {
        this.target = {x: x, y: y};
    };

    Entity.prototype.collide = function (other) {
        var mw2 = this.width / 2;
        var mh2 = this.height / 2;
        
        var ow2 = other.width / 2;
        var oh2 = other.height / 2;

        var myCorners = [
            {x: this.x - mw2, y: this.y - mh2}, // TL
            {x: this.x + mw2, y: this.y - mh2}, // TR
            {x: this.x - mw2, y: this.y + mh2}, // BL
            {x: this.x + mw2, y: this.y + mh2}  // BR
        ];

        var ret = _.all(myCorners, function (corner) {
            var xOK = (corner.x < (other.x - ow2) || corner.x > (other.x + ow2));
            var yOK = (corner.y < (other.y - oh2) || corner.y > (other.y + oh2));

            return xOK || yOK;
        });

        return !ret; 
    };

    Entity.prototype.hasHitWall = function () {
        var ret = this.wallHit;
        this.wallHit = false;
        return ret;
    };

    Entity.prototype.draw = function (ctx) {
        if (!this.visible) return;

        var gid = this.gid;
        var tileset = this.map.findTileset(gid);

        var ew2 = this.width / 2;
        var eh2 = this.height / 2;

        if (tileset) {
            var poses = this.poses;
            var pose = poses ? poses[this.anim.pose] : undefined;
            var frames = pose ? pose.frames : undefined;
            var frame = frames ? frames[this.anim.frame % frames.length] : undefined;

            var gidOffset = frame ? frame : 0;

            var txy = Util.toXY(gid + gidOffset - tileset.firstgid,
                    tileset.imagewidth / tileset.tilewidth);

            ctx.drawImage(tileset.img,
                    txy.x * tileset.tilewidth,
                    txy.y * tileset.tileheight,
                    tileset.tilewidth,
                    tileset.tileheight,
                    Math.floor(this.x - ew2),
                    Math.floor(this.y - eh2),
                    Math.floor(this.width),
                    Math.floor(this.height));
        }
    };

    return Entity; 
});
