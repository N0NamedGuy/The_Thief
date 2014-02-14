define(["layer", "lib/util", "lib/listener", "lib/underscore"], function (Layer, Util, listener) {
    "use strict";

    /**
     * Map related functions. This class covers everything
     * from map loading to map rendering, as well as some map
     * utility functions.
     *
     * @author David Serrano <david.ma.serrano@gmail.com>
     * @exports Map
     *
     * @requires Layer
     * @requires $_
     * @requires Listener
     * @requires _
     *
     * @constructor
     */
    var Map = function () {};

    listener(Map);

    /**
     * A callback that is called when a tileset is loaded.
     * @callback TilesetLoaded
     * @param {Tileset} tileset the loaded tileset.
     */

    /**
     * Loads tilesets.
     * @param {Tileset} tileset The tileset to load/augment with an image.
     * @param {Map~TilesetLoaded} loadedFun Callback for when the tileset image
     *      is loaded.
     */
    var loadTileset = function (tileset, loadedFun) {
        var img = new Image();

        img.onload = function () {
            loadedFun();
        };

        img.src = "maps/" + tileset.image;
        tileset.img = img;

        return tileset;
    };

    /**
     * Map loaded callback.
     * @callback Map~MapLoaded
     */

    /**
     * Handler for when tilesets are loaded.
     *
     * @param {Map~MapLoaded} Function called when the map is loaded.
     * @param {object} ctx The object to which the callback function should be
     *      bound to.
     */
    var tilesetsLoaded = function (cb, ctx) {
        return function (tilesets) {
            var layers = _.map(this.layers, function (layer) {
                return new Layer(layer, this);
            }, this);

            this.layers = layers;

            this.dispatchEvent("maploaded");
            $_.callback(cb, ctx, [this]);
        };
    };

    /**
     * Loads a map object and its tilesets.
     *
     * @fires maploaded
     * @param {TiledMap} mapObject A map in TMX/JSON format (from Tiled Map Editor).
     * @param {Map~MapLoaded} cb Callback for when the map is loaded.
     * @param {object} ctx The object to which the callback function should be
     *      bound to.
     */
    Map.prototype.load = function (mapObject, cb, ctx) {
        _.extend(this, mapObject);

        /* Load tilesets */
        Util.loadAsynch(this.tilesets, loadTileset,
               tilesetsLoaded(cb, ctx), this);
    };

    /**
     * Loads a map object from an internet resource.
     *
     * @fires maploaded
     * @param {TiledMap} filename The map file name.
     * @param {Map~MapLoaded} cb Callback for when the map is loaded.
     * @param {object} ctx The object to which the callback function should be
     *      bound to.
     */
    Map.prototype.loadJSON = function (filename, cb, ctx) {
        Util.getJSON(filename, function (mapJSON) {
            this.load(mapJSON, cb, ctx);
        }, this);
    };

    /**
     * Converts a tile index to (X,Y) coordinates.
     *
     * @param {number} index The tile index.
     * @returns {Coordinate} The point/square coordinates.
     */
    Map.prototype.toXY = function (index) {
        return Util.toXY(index, this.width);
    };

    /**
     * Converts an (X,Y) coordinate to an index.
     *
     * @param {number} x The X coordinate.
     * @param {number} y The Y coordinate.
     * @returns {number} The tile index.
     */
    Map.prototype.fromXY = function (x, y) {
        return Util.fromXY(x, y,
                this.tilewidth, this.tileheight,
                this.width);
    };

    /**
     * Finds the tileset to which a specific tile belongs to.
     *
     * @param {number} gid The tile's gid.
     * @returns {Tileset} the tileset to which the tile belongs to.
     */
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

    /**
     * Find a layer by its name.
     *
     * @param {String} name The layer's name.
     * @returns {Layer} The layer.
     */
    Map.prototype.findLayer = function(name) {
        return _.findWhere(this.layers, {name: name});
    };

    /**
     * Draws the map.
     *
     * @param {Camera} camera The camera to draw to.
     */
    Map.prototype.draw = function (camera) {
        var screen = camera.getScreen();
        var ctx = screen.getCtx(); 

        ctx.save();
        camera.transform(ctx);

        _.each(this.layers, function (layer) {
            layer.draw(ctx);
        });

        ctx.restore();
    };

    Map.prototype.getProperty = function (key) {
        if (this.properties && (key in this.properties)) {
            return this.properties[key];
        }
        return undefined;
    }

    return Map; 
});
