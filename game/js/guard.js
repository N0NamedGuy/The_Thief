define(["entity", "follow_sprite", "lib/util", "underscore/underscore"],
        function (Entity, FollowSprite, Util) {

    "use strict";

    var Guard = function (entity, player, map, alertImg, entities_data) {
        this.alertedSprite = new FollowSprite(alertImg, this, {
            x: 0,
            y: -alertImg.height
        });

        Entity.call(this, entity, map, entities_data);

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
        var props = aiLayer.getProperties(this.x, this.y);
        
        // Check distance to player
        var distX = Math.round(Math.abs(this.x - this.player.x) / this.map.tilewidth);
        var distY = Math.round(Math.abs(this.y - this.player.y) / this.map.tileheight);
        var dist = distX + distY; // Manhattan distance
        var order = this.aiorder;

        // FIXME: only dispatch the event. Order setting and extra behaviour (alerted sprite, for instance) should be shown while listening to the alerted event.
        if (this.aifollowdist > 0 && dist <= this.aifollowdist) {
            order = "follow";
            if (!this.alerted) {
                this.alerted = true;
                
                this.alertedSprite.visible = true;
                
                this.dispatchEvent("alerted", this);
            }
            this.speed = this.aifollowspeed;

        } else if (props && props.aiorder) {
            this.speed = this.start.speed;
            if (this.aiorder !== props.aiorder) {
                this.prevOrder = this.aiorder;
                this.aiorder = props.aiorder;
                order = this.aiorder;
            }
            if (this.alerted) {
                this.alerted = false;
                this.alertedSprite.visible = false;
                this.dispatchEvent("alerted", this);
            }
        }

        var fun = this.orders[order];
        if (fun !== undefined) {
            fun.call(this, dt);
        }

        if (this.collide(this.player)) {
            this.dispatchEvent("hit");
        }

        return Entity.prototype.update.call(this, dt, bgLayer);
    };

    Guard.prototype.draw = function (ctx) {
        var ret = Entity.prototype.draw.call(this, ctx);
        this.alertedSprite.draw(ctx);
        return ret;
    }

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
            this.moveRelative(dt, 0);
        }, up : function (dt) {
            this.moveRelative(0, -dt);
        }, down: function (dt) {
            this.moveRelative(0, dt);
        }, follow: function (dt) {
            this.setTarget(this.player.x, this.player.y);
        }, stop: function (dt) {
        }
    };

    Guard.prototype.reset = function () {
        this.alerted = undefined;
        this.alertedSprite.visible = false;
        Entity.prototype.reset.call(this);
    };

    return Guard;
    
});
