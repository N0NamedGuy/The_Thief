define(["layer", "lib/util", "lib/underscore"], function (Layer, Util) {
    "use strict";
    var Map = function () {};

    var loadTileset = function (tileset, loadedFun) {
        var img = new Image();

        img.onload = function () {
            loadedFun();
        };

        img.src = "maps/" + tileset.image;
        tileset.img = img;

        return tileset;
    };

    var tilesetsLoaded = function (cb, ctx) {
        return function (tilesets) {
            var layers = _.map(this.layers, function (layer) {
                return new Layer(layer, this);
            }, this);

            this.layers = layers;

            $_.callback(cb, ctx, [this]);
        };
    };

    Map.prototype.load = function (mapObject, cb, ctx) {
        _.extend(this, mapObject);

        /* Load tilesets */
        Util.loadAsynch(this.tilesets, loadTileset,
               tilesetsLoaded(cb, ctx), this);
    };

    Map.prototype.loadJSON = function (filename, cb, ctx) {
        Util.getJSON(filename, function (mapJSON) {
            this.load(mapJSON, cb, ctx);
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

    Map.prototype.findLayer = function(name) {
        return _.findWhere(this.layers, {name: name});
    };

    Map.prototype.draw = function (camera, ctx) {
        ctx.save();

        camera.transform(ctx);

        _.each(this.layers, function (layer) {
            layer.draw(ctx);
        });

        ctx.restore();
    };

    return Map; 
});
