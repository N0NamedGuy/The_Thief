define(["entity", "lib/util", "lib/underscore"], function (Entity, Util) {
    "use strict";

            //var guard = new Guard(entity, player, map, entities);

    var Guard = function (entity, player, map, entities_data) {
        Entity.call(this, entity, map, entities_data);


        this.isFollowing = false;
        this.player = player;

        if (this.properties.aiorder) {
            this.aiorder = this.properties.aiorder;
        } else {
            this.aiorder = "stop";
        }

        if (this.properties.aifollowdist) {
            this.aifollowdist= parseInt(this.properties.aifollowdist, 10);
        } else {
            this.aifollowdist= 3;
        }
            
        if (this.properties.aifollowspeed) {
            this.aifollowspeed = parseInt(this.properties.aifollowspeed, 10);
        } else {
            this.aifollowspeed = Math.floor(3 * (player.start.speed / 4));
        }
    };

    Guard.prototype = Object.create(Entity.prototype);

    Guard.prototype.update = function (dt, bgLayer, aiLayer) {
        var props = this.map.getTileProps(aiLayer, this.x, this.y);
        
        // Check distance to player
        var distX = Math.round(Math.abs(this.x - this.player.x) / this.map.tilewidth);
        var distY = Math.round(Math.abs(this.y - this.player.y) / this.map.tileheight);
        var dist = distX + distY; // Manhattan distance
        var order = this.aiorder;

        if (this.aifollowdist > 0 && dist <= this.aifollowdist) {
            order = "follow";
            if (!this.alerted) {
                // TODO: trigger alert event here
                this.alerted = true;
            }
            this.speed = this.aifollowspeed;

        } else if (props && props.aiorder) {
            this.speed = this.start.speed;
            if (this.aiorder !== props.aiorder) {
                this.prevOrder = this.aiorder;
                this.aiorder = props.aiorder;
                order = this.aiorder;
            }
            this.alerted = false;
        }

        var fun = this.orders[order];
        if (fun !== undefined) {
            fun.call(this, dt);
        }

        this._update(dt, bgLayer);
    };

    Guard.prototype.orders = {
        rand: function (dt) {
            if (this.target === undefined || this.hasHitWall()) {
                var dir = Math.floor(Math.random() * 4);
                var amt = Math.floor(Math.random() * 200);
                
                switch (dir) {
                case 0:
                    this.setTarget(this.x + amt, this.y);
                    break;
                case 1:
                    this.setTarget(this.x - amt, this.y);
                    break;
                case 2:
                    this.setTarget(this.x, this.y + amt);
                    break;
                case 3:
                    this.setTarget(this.x, this.y - amt);
                    break;
                }
            }
        }, pause: function (dt) {
            var curTime = Util.getTicks();
            if (this.pauseTime === undefined) {
                this.pauseTime = curTime;
            }

            if (curTime - this.pauseTime > 1000) {
                this.order = prevOrder; 
            }
        }, left : function (dt) {
            this.moveRelative(-dt, 0);
        }, right: function (dt) {
            this.moveRelative(0);
        }, up : function (dt) {
            this.moveRelative(0, -dt);
        }, down: function (dt) {
            this.moveRelative(0, dt);
        }, follow: function (dt) {
            this.setTarget(this.player.x, this.player.y);
        }, stop: function (dt) {
        }
    };


    return Guard;
    
});
