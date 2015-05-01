define(["lib/util", "lib/listener", "underscore/underscore"], function (Util, listener) {
    "use strict";

    var PLAYER_STYLE = "darkgreen";
    var ENEMY_STYLE = "orange";
    var ALERTED_STYLE = "red";
    var GOAL_STYLE = "brown";
    var WALKABLE_STYLE = "lightgreen";
    var WALL_STYLE = "lightgray";
    var EXIT_STYLE = "#005500"


    var TILE_SIZE = 4;
    var ENT_SIZE = 2;

    var prerenderRadarBg = function (layer) {
        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext("2d");
        var data = layer.data;
        var map = layer.map;

        canvas.imageSmoothingEnabled = false;

        ctx.save();

        for (var i = 0; i < data.length; i++) {
            var gid = data[i];
            var tileset = map.findTileset(gid);

            if (tileset) {
                var props = layer.getPropertiesByIndex(i);
                var xy = map.toXY(i);

                if (props && props.isexit === "true") {
                    ctx.fillStyle = EXIT_STYLE;
                } else if (props && props.walkable === "true") {
                    ctx.fillStyle = WALKABLE_STYLE;
                } else {
                    ctx.fillStyle = WALL_STYLE;
                }

                ctx.fillRect(
                        Math.floor(xy.x * TILE_SIZE),
                        Math.floor(xy.y * TILE_SIZE),
                        TILE_SIZE, TILE_SIZE);
            }
        }
        ctx.restore();

        return canvas;
    }

    var drawEntity = function (ctx, ent, style) {
        var layer = this.layer;
        var map = layer.map;

        var tw = map.tilewidth;
        var th = map.tileheight;

        ctx.save();

        ctx.fillStyle = style;
        ctx.fillRect(
                (ent.x / tw) * TILE_SIZE - (ENT_SIZE / 2),
                (ent.y / th) * TILE_SIZE - (ENT_SIZE / 2),
                ENT_SIZE, ENT_SIZE);

        ctx.restore();
    }


    var Radar = function (layer) {
        this.layer = layer;
        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");

        this.width = layer.width * TILE_SIZE;
        this.height = layer.height * TILE_SIZE;
    };

    Radar.prototype.setEntities = function (player, enemies, goal) {
        if (this.bgCanvas === undefined) {
            this.bgCanvas = prerenderRadarBg(this.layer);
        }

        this.player = player;
        this.enemies = enemies;
        this.goal = goal;
    };

    Radar.prototype.draw = function (outCtx) {
        var canvas = this.canvas;
        var bgCanvas = this.bgCanvas;
        var ctx = this.ctx;

        var player = this.player;
        var enemies = this.enemies;
        var goal = this.goal;

        ctx.drawImage(bgCanvas, 0, 0);

        drawEntity.call(this, ctx, player, PLAYER_STYLE);
        _.each(enemies, function (enemy) {
            drawEntity.call(this, ctx, enemy,
                enemy.alerted ? ALERTED_STYLE : ENEMY_STYLE);
        }, this);

        if (!goal.isOpen)
            drawEntity.call(this, ctx, goal, GOAL_STYLE);

        outCtx.drawImage(canvas, 0, 0);

    };

    return Radar;
});
