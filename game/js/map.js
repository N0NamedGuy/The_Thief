define(["lib/util", "lib/underscore"], function (Util) {
    "use strict";
    var Map = function (filename, canvas) {
        var bgCanvas = document.createElement("canvas");
        var fgCanvas = document.createElement("canvas");
        var bgCtx, fgCtx;
        var map;

        Util.getJSON(json, function (map) {
            this.map = map;
            fgCanvas.width = bgCanvas.width = map.width * map.tileheight;
            fgCanvas.height = bgCanvas.height = map.height * map.tilewidth;
            fgCanvas.dirty = bgCanvas.dirty = true;

            bgCtx = bgCanvas.getContext("2d");
            fgCtx = fgCanvas.getContext("2d");
            bgCtx.imageSmoothingEnabled = false;
            fgCtx.imageSmoothingEnabled = false;

            if (typeof this.onload === "function") {
                this.onload(newMap);
            }
        });
    };

    map.prototype.toXY = function (index) {
        return Util.toXY(index, this.width);
    };

    map.prototype.fromXY = function (x, y) {
        return Util.fromXY(x, y, this.tilewidth, this.tileheight, this.width);
    };

    map.prototype.findTileset = function (gid) {
        var tilesets = _.filter(this.map.tilesets, function (tileset) {
            return gid >= tileset.firstgid;
        });

        if (tilesets.length === 0) {
            return undefined;
        }

        return _.max(tilesets, function (tileset) {
            return tileset.firstgid;
        });
    };

    map.prototype.drawTileLayer = function (layer, ctx) {
        for (var i = 0; i < layer.data.length; i++) {
            var gid = layer.data[i];
            var xy = this.toXY(i);

            var tileset = this.findTileset(gid);

            if (tileset) {
                var txy = toXY(gid - tileset.firstgid,
                        tileset.imagewidth / tileset.tilewidth);

                ctx.drawImage(tileset.img,
                    txy.x * tileset.tilewidth,
                    txy.y * tileset.tileheight,
                    tileset.tilewidth,
                    tileset.tileheight,
                    Math.floor(xy.x * this.map.tilewidth),
                    Math.floor(xy.y * this.map.tileheight),
                    tileset.tilewidth,
                    tileset.tileheight);
            }
        }
    };

    map.prototype._drawCached = function (layer, cacheCanvas, cacheCtx, ctx) {
        if (cacheCanvas.dirty) {
            this.drawTileLayer(layer, cacheCtx);
            cacheCtx.dirty = false;
        }
        ctx.drawImage(cacheCanvas, 0, 0);
    };

    map.prototype.drawBgLayer = function (layer, ctx) {
        return this._drawCached(layer, this.bgLayer, this.bgCtx, ctx);
    };

    map.prototype.drawFgLayer = function (layer, ctx) {
        return this._drawCached(layer, this.fgLayer, this.fgCtx, ctx);
    };

    map.prototype.drawEntity = function (entities, cam, ctx) {
        if (entity.visible === false) return;

        var gid = entity.gid;
        var tileset = this.findTileset(gid);

        var real_x = entity.x - cam.offx;
        var real_y = entity.y - cam.offx;
        var ew2 = entity.width / 2;
        var eh2 = entity.height / 2;

        if (tileset) {
            var ent_poses = entity.poses;
            var ent_pose = ent_poses ? ent_poses[entity.anim.pose] : undefined;
            var ent_frames = ent_pose ? ent_pose.frames : undefined;
            var ent_frame = ent_frames ? ent_frames[entity.anim.frame % ent_frames.length] : undefined;

            var gid_offset = ent_frame ? ent_frame : 0;

            var txy = toXY((gid + gid_offset) - tileset.firstgid, 
                tileset.imagewidth / tileset.tilewidth);

            ctx.drawImage(tileset.img,
                txy.x * tileset.tilewidth,
                txy.y * tileset.tileheight,
                tileset.tilewidth,
                tileset.tileheight,
                Math.floor(entity.x - ew2),
                Math.floor(entity.y - eh2),
                tileset.tilewidth,
                tileset.tileheight);
            
            // FIXME: find a way to draw alerted (maybe as a new entity?)
            /*
            if (entity.alerted) {
                ctx.drawImage(Assets.images.alerted,
                    Math.floor(entity.x - ew2),
                    Math.floor(entity.y - eh2) - tileset.tileheight);
            }*/
        }
    };

    Map.prototype.getLayer = function(name) {
        return _.find(this.map.layers, function (layer) {
            return layer.name === name;
        });
    };

    Map.prototype.getTileProps = function(layer, x, y) {
        var index = this.fromXY(x, y); 
        var gid = layer.data[index];

        if (!gid) return null;
        var tileset = this.findTileset(gid);
        if (!tileset) return null;
        gid -= tileset.firstgid;

        var props = tileset.tileproperties;
        return props[gid];
    };

    return Map; 
});
