define(["lib/util", "lib/underscore"], function (Util) {
    "use strict";
    var Layer = function (layer, map) {
        var canvas,
            ctx;

        _.extend(this, layer);
        this.map = map;

        canvas = document.createElement("canvas");
        canvas.width = this.map.width * this.map.tilewidth;
        canvas.height = this.map.height * this.map.height;
        canvas.dirty = true;
        
        ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;

        this.canvas = canvas;
        this.ctx = ctx;

    };

    Layer.prototype._drawTiled = function (ctx) {
        var c = 0;
        var map = this.map;

        if (!this.data) return;

        for (var i = 0; i < this.data.length; i++) {
            var gid = this.data[i];
            var xy = map.toXY(i);

            var tileset = map.findTileset(gid);

            if (tileset) {
                var txy = Util.toXY(gid - tileset.firstgid,
                        tileset.imagewidth / tileset.tilewidth);

                ctx.drawImage(tileset.img,
                    txy.x * tileset.tilewidth,
                    txy.y * tileset.tileheight,
                    tileset.tilewidth,
                    tileset.tileheight,
                    Math.floor(xy.x * map.tilewidth),
                    Math.floor(xy.y * map.tileheight),
                    tileset.tilewidth,
                    tileset.tileheight);

                c++;
            }
        }
    };

    Layer.prototype.drawTiled = function (ctx) {
        var canvas = this.canvas;
        var cachedctx = this.ctx;

        if (canvas.dirty) {
            this._drawTiled(cachedctx);
            canvas.dirty = false;
        }
        ctx.drawImage(canvas, 0, 0);
    };

    Layer.prototype.drawObject = function (object, ctx) {
    }

    Layer.prototype.drawObjects = function (ctx) {
        function drawObject(object) {
            if (object.visible === false) return;

            var gid = object.gid;
            var tileset = this.map.findTileset(gid);

            var ew2 = object.width / 2;
            var eh2 = object.height / 2;

            if (tileset) {
                var ent_poses = object.poses;
                var ent_pose = ent_poses ? ent_poses[object.anim.pose] : undefined;
                var ent_frames = ent_pose ? ent_pose.frames : undefined;
                var ent_frame = ent_frames ? ent_frames[object.anim.frame % ent_frames.length] : undefined;

                var gid_offset = ent_frame ? ent_frame : 0;

                var txy = Util.toXY((gid + gid_offset) - tileset.firstgid, 
                    tileset.imagewidth / tileset.tilewidth);

                ctx.drawImage(tileset.img,
                    txy.x * tileset.tilewidth,
                    txy.y * tileset.tileheight,
                    tileset.tilewidth,
                    tileset.tileheight,
                    Math.floor(object.x - ew2),
                    Math.floor(object.y - eh2),
                    tileset.tilewidth,
                    tileset.tileheight);
                
            }
        }
        _.each(this.objects, drawObject, this);
    }

    Layer.prototype.draw = function (ctx) {
        if (this.visible === false) return;

        if (this.type === "tilelayer") {
            this.drawTiled(ctx);
        } else if (this.type === "objectgroup") {
            this.drawObjects(ctx);
        }
    }

    Layer.prototype.getProperties = function (x, y) {
        var map = this.map;
        var index = map.fromXY(x, y); 
        var gid = this.data[index];

        if (!gid) return null;
        var tileset = map.findTileset(gid);
        if (!tileset) return null;
        gid -= tileset.firstgid;

        var props = tileset.tileproperties;
        return props[gid];
    };

    return Layer;
});
