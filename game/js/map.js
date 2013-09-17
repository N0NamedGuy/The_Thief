define(["lib/util", "lib/underscore"], function (Util) {
    "use strict";
    var Map = function () {};

    function loadTileset(tileset, loadedFun) {
        var img = new Image();

        img.onload = function () {
            loadedFun();
        };

        img.src = "maps/" + tileset.image;
        tileset.img = img;

        return tileset;
    }

    Map.prototype.load = function (filename, cb) {
        Util.getJSON(filename, function (mapJSON, map) {
            map.map = mapJSON;

            map.tilewidth = mapJSON.tilewidth;
            map.tileheight = mapJSON.tileheight;
            map.properties = mapJSON.properties;

            /* Load tilesets */
            Util.loadAsynch(mapJSON.tilesets, loadTileset, function (tilesets) {
                map.bgLayer = map.getLayer("background");
                map.fgLayer = map.getLayer("foreground");

                map.map.tilesets = map.tilesets = tilesets;

                if (typeof cb === "function") {
                    cb(map);
                }
            });
        }, this);

    };

    Map.prototype.toXY = function (index) {
        return Util.toXY(index, this.map.width);
    };

    Map.prototype.fromXY = function (x, y) {
        return Util.fromXY(x, y,
                this.map.tilewidth, this.map.tileheight,
                this.map.width);
    };

    Map.prototype.findTileset = function (gid) {
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

    Map.prototype._drawTileLayer = function (layer, ctx) {
        var c = 0;
        for (var i = 0; i < layer.data.length; i++) {
            var gid = layer.data[i];
            var xy = this.toXY(i);

            var tileset = this.findTileset(gid);

            if (tileset) {
                var txy = Util.toXY(gid - tileset.firstgid,
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

                c++;
            }
        }
    };

    Map.prototype.drawTileLayer = function (layer, ctx) {
        var canvas = layer.canvas;
        var cachedctx = layer.ctx;
        if (typeof canvas === "undefined") {
            canvas = document.createElement("canvas");
            canvas.width = this.map.width * this.map.tilewidth;
            canvas.height = this.map.height * this.map.tileheight;
            canvas.dirty = true;
            cachedctx = canvas.getContext("2d");
            cachedctx.imageSmoothingEnabled = false;

            layer.canvas = canvas;
            layer.ctx = cachedctx;
        }

        if (canvas.dirty) {
            this._drawTileLayer(layer, cachedctx);
            canvas.dirty = false;
        }
        ctx.drawImage(canvas, 0, 0);
    };

    Map.prototype.drawEntity = function (entity, cam, ctx) {
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

            var txy = Util.toXY((gid + gid_offset) - tileset.firstgid, 
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
