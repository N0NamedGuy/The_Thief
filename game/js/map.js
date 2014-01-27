define(["layer", "lib/util", "lib/underscore"], function (Layer, Util) {
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

    /**
     *  Loads the map
     */
    Map.prototype.load = function (filename, cb) {
        Util.getJSON(filename, function (mapJSON, map) {
            _.extend(map, mapJSON);

            /* Load tilesets */
            Util.loadAsynch(map.tilesets, loadTileset, function (tilesets) {
                map.bgLayer = map.getLayer("background");
                map.fgLayer = map.getLayer("foreground");

                var layers = _.map(map.layers, function (layer) {
                    return new Layer(layer, map);
                });

                map.layers = layers;

                if (typeof cb === "function") {
                    cb(map);
                }
            });
        }, this);
    };

    Map.prototype.toXY = function (index) {
        return Util.toXY(index, this.width);
    };

    Map.prototype.fromXY = function (x, y) {
        return Util.fromXY(x, y,
                this.tilewidth, this.tileheight,
                this.width);
    };

    Map.prototype.findTileset = function (gid) {
        var tilesets = _.filter(this.tilesets, function (tileset) {
            return gid >= tileset.firstgid;
        });

        if (tilesets.length === 0) {
            return undefined;
        }

        return _.max(tilesets, function (tileset) {
            return tileset.firstgid;
        });
    };

    Map.prototype.draw = function (ctx) {
        _.each(this.layers, function (layer) {
            layer.draw(ctx);
        });
    };

    Map.prototype.drawTileLayer = function (layer, ctx) {
        layer.draw(ctx);
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
            
        }
    };

    Map.prototype.getLayer = function(name) {
        return _.find(this.layers, function (layer) {
            return layer.name === name;
        });

        // FIXME: use appropriate underscore function to find stuff
        // return _.pick(this.layers, {name: name});
    };

    return Map; 
});
