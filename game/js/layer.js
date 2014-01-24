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

    Layer.prototype._draw = function (ctx) {
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

    Layer.prototype.draw = function (ctx) {
        // TODO: Check if layer type is "tilelayer" or "objectgroup"

        var canvas = this.canvas;
        var cachedctx = this.ctx;

        if (canvas.dirty) {
            this._draw(cachedctx);
            canvas.dirty = false;
        }
        ctx.drawImage(canvas, 0, 0);
    };

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
