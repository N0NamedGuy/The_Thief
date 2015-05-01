define(["assets",
        "map",
        "countdown",
        "radar",
        "entity",
        "player",
        "guard",
        "goal",
        "input",
        "audio",
        "camera",
        "screen",
        "lib/util",
        "lib/listener",
        "underscore/underscore"],


function (Assets,
        Map,
        Countdown,
        Radar,
        Entity,
        Player,
        Guard,
        Goal,
        Input,
        Audio,
        Camera,
        Screen,
        $_,
        listener,
        __) {
    "use strict";

    /**
     * A callback without any kind of arguments.
     * @callback ThiefGame~NoArgCallback
     */

    /**
     * Where the game is at. All game logic is implemented here.
     *
     * @author David Serrano <david.ma.serrano@gmail.com>
     * @exports ThiefGame
     *
     * @requires Map
     * @requires Countdown
     * @requires Radar
     * @requires Entity
     * @requires Player
     * @requires Guard
     * @requires Goal
     * @requires Input
     * @requires Audio
     * @requires Camera
     * @requires Screen
     * @requires $_
     * @requires Listener
     * @requires _
     *
     * @constructor
     * @param {HTMLElement} container The HTML element that will act as container
     *      for the game. Usually a <code>&lt;div&gt;</code> element.
     * @param {ThiefGame~NoArgCallback} callback The callback function that is
     *      when the game assets are loaded.
     * @param {Object} ctx The object to which the callback function will be bound.
     */
    var ThiefGame = function (container, callback, ctx) {
        var screen = new Screen(container);
        var camera = new Camera(screen,
                CAM_SHAKE, CAM_LAZINESS, CAM_FRICTION);
        var input = new Input(camera);
        
        this.screen = screen;
        this.camera = camera;
        this.input = input;
        
        this.levelName = undefined;

        Assets.load(function() {
            Audio.load(Assets);
            $_.callback(callback, ctx);
        }, this);
    };

    listener(ThiefGame);

    /********************************************
     * Game "constants" and adjustables are here
     ********************************************/
    /**
     * The maps base path.
     * @constant {String}
     * @readonly
     * @default
     */
    var MAP_BASE_DIR = "maps/";
    /**
     * The entities file.
     * @constant {String}
     * @readonly
     * @default
     */
    var ENTITIES_FILE = "entities.json";

    /**
     * The name of the background layer.
     * @constant {String}
     * @readonly
     * @default
     */
    var LAYER_BACKGROUND = "background";
    /**
     * The name of the AI layer.
     * @constant {String}
     * @readonly
     * @default
     */
    var LAYER_AI = "ai";
    /**
     * The name of the entities layer.
     * @constant {String}
     * @readonly
     * @default
     */
    var LAYER_ENTITIES = "entities";
    
    var ENTITY_PLAYER = "player";
    var ENTITY_GOAL = "treasure";
    var ENTITY_GUARD = "guard";

    /**
     * The number of seconds the player (thief) has to escape,
     * after he/she gets the treasure/goal.
     * @constant {number}
     * @readonly
     * @default
     */
    var ESCAPE_TIME = 10;
    
    /**
     * The camera's shake intensity. Higher numbers
     * make it shake more intensily when the countdown
     * is ticking. The value is mesaure in pixels.
     * @constant {number}
     * @readonly
     * @default
     */
    var CAM_SHAKE = 16;
    /**
     * Defines how lazy the camera is to start moving.
     * @constant {number}
     * @readonly
     * @default
     */
    var CAM_LAZINESS = 5;
    /**
     * The camera's friction factor.
     * @constant {number}
     * @readonly
     * @default
     */
    var CAM_FRICTION = 6;

    /**
     * The default level name for a custom or imported map.
     * @constant {String}
     * @readonly
     * @default
     */
    var CUSTOM_LEVEL_NAME = "custom_level";
    
    /********************************************
     * Private functions are here
     ********************************************/

    /**
     * @method sanitizeMap
     * @private
     * @param {Map} map
     */
    var sanitizeMap = function (map) {
        // Check if needed layers exist
        var bgLayerName = map.getProperty("backgroundlayer");
        var aiLayerName = map.getProperty("ailayer");
        var entitiesLayerName = map.getProperty("entitieslayer");

        bgLayerName = bgLayerName ? bgLayerName : LAYER_BACKGROUND;
        aiLayerName = aiLayerName ? aiLayerName : LAYER_AI;
        entitiesLayerName = entitiesLayerName ? entitiesLayerName : LAYER_ENTITIES;

        var bgLayer = map.findLayer(bgLayerName);
        var aiLayer = map.findLayer(aiLayerName);
        var entitiesLayer = map.findLayer(entitiesLayerName);

        if (!bgLayer) {
            console.error("No '" + bgLayerName + "' layer on map for the background!");
            return;
        }

        if (!aiLayer) {
            console.error("No '" + aiLayerName + "' layer on map for the AI!");
            return;
        }
        
        if (!entitiesLayer) {
            console.error("No '" + entitiesLayerName + "' layer on map for the entities!");
            return;
        }

        // Check if needed entities exist
        var player = entitiesLayer.findObject(ENTITY_PLAYER);
        if (!player) {
            console.error("No '" + ENTITY_PLAYER + "' entity on map!");
            return;
        }

        var goal = entitiesLayer.findObject(ENTITY_GOAL);
        if (!player) {
            console.error("No '" + ENTITY_GOAL + "' entity on map!");
            return;
        }

        var guards = entitiesLayer.findObjects(ENTITY_GUARD);
        if (guards.length === 0) {
            console.warn("No '" + ENTITY_GUARD + "' entities on map!");
        }

        return true;
    }

    /**
     * Loads all entities
     *
     * @memberof! ThiefGame
     * @param {Layer} layer
     * @param callback
     * @fires entitiesloaded
     */
    var loadEntities = function (layer, callback) {
        $_.getJSON(ENTITIES_FILE, function (entities) {
            var player = layer.findObject("player");
            var goal = layer.findObject("treasure");
            var guards = layer.findObjects("guard");

            var map = this.map;

            if (!player) {
                console.error("Player object not found in map!");
                return;
            }
            
            if (!goal) {
                console.error("Goal object not found in map!");
                return;
            }

            player = new Player(player, map, entities);
            goal = new Goal(goal, map, entities);

            var countdown = this.countdown;
            goal.addEventListener("open", function () {
                countdown.start();
                Audio.play("alerted");
            });

            var thisCtx = this;
            guards = _.map(guards, function (guard_) {
                var guard = new Guard(guard_, player, map,
                    Assets.images["alerted"], entities);


                guard.addEventListener("alerted", function (e, g) {
                    if (g.alerted) {
                        Audio.play("alerted");
                    }
                });

                guard.addEventListener("hit", function () {
                    Audio.play("hit");
                    restartLevel.call(thisCtx);
                });

                return guard;
            });

            // Augment the layer's objects, so the layer can render them
            _.each(_.union([player, goal], guards), function (entity) {
                entity.layer.objects[entity.index] = entity;
            });

            player.addEventListener("step", function () {
                Audio.play("step");
            });

            this.camera.setTarget(player);
            this.input.setPlayer(player);

            var radar = this.radar;
            if (radar) {
                radar.setEntities(player, guards, goal);
            }

            this.player = player;
            this.goal = goal;
            this.guards = guards;

            this.dispatchEvent("entitiesloaded");
            $_.callback(callback, this);
        }, this);
    };
   
    /**
     * Restarts the level.
     * @private
     */
    var restartLevel = function () {
        this.player.reset();
        this.goal.reset();
        _.each(this.guards, function (guard) {
            guard.reset();
        });
        this.countdown.reset();
    };

    /**
     * Processes the game's logic.
     * @private
     */
    var processLogic = function (dt) {
        var map = this.map;

        var bgLayer = this.bgLayer;
        var aiLayer = this.aiLayer;

        var player = this.player;
        var guards = this.guards;
        var goal = this.goal;

        var countdown = this.countdown;

        var ticks = $_.getTicks();

        this.camera.update(countdown.remaining);

        player.update(dt, bgLayer);
        _.each(guards, function (guard) {
            guard.update(dt, bgLayer, aiLayer);
        });

        if (player.collide(goal)) {
            goal.open(player);
            this.dispatchEvent("goal", {
                goal: goal,
                player: player
            });
        }

        countdown.update();

        function playNext() {
            var nextMap = map.getProperty("nextmap");

            if (nextMap) {
                this.playLevel(nextMap);
            } else {
                console.error("No next map property has been found...!");
            }
        }

        var props = bgLayer.getProperties(player.x, player.y);
        if (props && props.isexit && props.isexit === "true") {
            if (player.goals > 0) {
                playNext.call(this);
            }
        }

        var nextMapTimeout = this.nextMapTimeout;
        if (nextMapTimeout && (ticks - this.gameStart > nextMapTimeout)) {
            playNext.call(this);
        }
    };

    /**
     * Makes a graphical rendering of the game state.
     * @private
     */
    var renderGame = function () {
        var camera = this.camera;
        var screen = this.screen;
        var radar = this.radar;

        var ctx = screen.getCtx();

        ctx.clearRect(0, 0, screen.width, screen.height); 

        this.map.draw(camera);
        this.countdown.draw(ctx);

        if (radar) {
            ctx.save();
            ctx.translate(Math.floor(screen.width - radar.width), 0);
            radar.draw(ctx);
            ctx.restore();
        }

        screen.flip();
    };

    /**
     * The game's "main loop" that should be called from time to time.
     * @private
     */
    var mainloop = function () {
        var curTime = $_.getTicks();
        var dt = (curTime - this.lastUpdate) / 60;

        this.input.process(dt, this.camera);

        processLogic.call(this, dt);
        renderGame.call(this);

        this.lastUpdate = curTime;

        var ctx = this;

        if (!this.isQuit) {
            $_.nextFrame(mainloop, this);
        } else {
            this.dispatchEvent("quit");
        }

    };

    /**
     * After everything is loaded, this function will start a new game.
     * @private
     * @param {Map} the map object to be played
     */
    var newGame = function (map) {
        var bgLayerName = map.getProperty("backgroundlayer");
        var aiLayerName = map.getProperty("ailayer");
        var entitiesLayerName = map.getProperty("entitieslayer");

        bgLayerName = bgLayerName ? bgLayerName : LAYER_BACKGROUND;
        aiLayerName = aiLayerName ? aiLayerName : LAYER_AI;
        entitiesLayerName = entitiesLayerName ? entitiesLayerName : LAYER_ENTITIES;

        var bgLayer = map.findLayer(bgLayerName);
        var aiLayer = map.findLayer(aiLayerName);
        var entLayer = map.findLayer(entitiesLayerName);

        var countdown = new Countdown(ESCAPE_TIME);
        countdown.addEventListener("tick", function () {
            Audio.play("blip");
        });

        var thisCtx = this;
        countdown.addEventListener("timeup", function () {
            if (countdown.failed) {
                restartLevel.call(thisCtx);
                Audio.play("timeup");
            }
        });

        var radar = undefined;
        var showRadar = map.getProperty("showradar");

        if (!showRadar || showRadar === "true") {
            radar = new Radar(bgLayer);
        }

        this.nextMapTimeout = parseInt(map.getProperty("nextmaptimeout")) * 1000;

        this.bgLayer = bgLayer;
        this.aiLayer = aiLayer;
        this.entitiesLayer = entLayer;

        this.countdown = countdown;
        this.radar = radar;

        this.isQuit = false;
        this.gameStart = this.lastUpdate = $_.getTicks();
        
        loadEntities.call(this, entLayer, mainloop);

    };

    /********************************************
     * Public functions are here
     ********************************************/

    /**
     * Plays a certain level.
     * @param {String|Map} level The level's name or a map object.
     * @fires levelchanged
     */
    ThiefGame.prototype.playLevel = function (level) {
        var map = new Map();
        this.map = map;

        this.quit();

        var onMapLoad = function (loadedMap) {
            if (!sanitizeMap(loadedMap)) {
                console.error("Level '" + level + "' has errors, can't play it");
                this.dispatchEvent("loaderror", level);
                return;
            }

            this.levelName = (typeof level === "string") ?
                level : CUSTOM_LEVEL_NAME;

            newGame.call(this, loadedMap);
            this.dispatchEvent("levelchanged", level);
        }
        
        if (typeof level === "string") {
            map.loadJSON(MAP_BASE_DIR +  level, onMapLoad, this);
        } else if (typeof level === "object") {
            map.load(level, onMapLoad, this);
        }

    };

    /**
     * Tells the game to quit.
     */
    ThiefGame.prototype.quit = function () {
        this.isQuit = true;
    };

    return ThiefGame;
});
