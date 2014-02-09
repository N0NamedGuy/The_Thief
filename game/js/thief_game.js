define(["assets",
        "map",
        "countdown",
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
        "lib/underscore"],


function (Assets,
        Map,
        Countdown,
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
        var screen = new Screen(container, this.SCREEN_W, this.SCREEN_H,
                this.SCREEN_SCALE);

        var camera = new Camera(screen,
                this.CAM_SHAKE, this.CAM_LAZINESS, this.CAM_FRICTION);
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
    ThiefGame.prototype.MAP_BASE_DIR = "maps/";
    /**
     * The entities file.
     * @constant {String}
     * @readonly
     * @default
     */
    ThiefGame.prototype.ENTITIES_FILE = "entities.json";

    /**
     * The name of the background layer.
     * @constant {String}
     * @readonly
     * @default
     */
    ThiefGame.prototype.LAYER_BACKGROUND = "background";
    /**
     * The name of the AI layer.
     * @constant {String}
     * @readonly
     * @default
     */
    ThiefGame.prototype.LAYER_AI = "ai";
    /**
     * The name of the entities layer.
     * @constant {String}
     * @readonly
     * @default
     */
    ThiefGame.prototype.LAYER_ENTITIES = "entities";
    
    /**
     * The number of seconds the player (thief) has to escape,
     * after he/she gets the treasure/goal.
     * @constant {number}
     * @readonly
     * @default
     */
    ThiefGame.prototype.ESCAPE_TIME = 9;
    
    /**
     * The game's screen width.
     * @constant {number}
     * @readonly
     * @default
     */
    ThiefGame.prototype.SCREEN_W = 800;
    /**
     * The game's screen height.
     * @constant {number}
     * @readonly
     * @default
     */
    ThiefGame.prototype.SCREEN_H = 600;
    /**
     * The screen's scale.
     * @constant {number}
     * @readonly
     * @default
     */
    ThiefGame.prototype.SCREEN_SCALE = 2;

    /**
     * The camera's shake intensity. Higher numbers
     * make it shake more intensily when the countdown
     * is ticking. The value is mesaure in pixels.
     * @constant {number}
     * @readonly
     * @default
     */
    ThiefGame.prototype.CAM_SHAKE = 16;
    /**
     * Defines how lazy the camera is to start moving.
     * @constant {number}
     * @readonly
     * @default
     */
    ThiefGame.prototype.CAM_LAZINESS = 5;
    /**
     * The camera's friction factor.
     * @constant {number}
     * @readonly
     * @default
     */
    ThiefGame.prototype.CAM_FRICTION = 6;

    /**
     * The default level name for a custom or imported map.
     * @constant {String}
     * @readonly
     * @default
     */
    ThiefGame.prototype.CUSTOM_LEVEL_NAME = "custom_level";
    
    /********************************************
     * Private functions are here
     ********************************************/

    /**
     * @method sanitizeMap
     * @private
     * @param {Map} map
     */
    var sanitizeMap = function (map) {
        // TODO: implement me
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
        $_.getJSON(this.ENTITIES_FILE, function (entities) {
            function objectFinder(type) {
                return function (obj, index) {
                    if (obj.type === type) {
                        obj.index = index;
                        obj.layer = layer;
                        return true;
                    }
                    return false;
                };
            }

            function findObject(type) {
                return _.find(layer.objects, objectFinder(type));
            }
                
            function findObjects(type) {
                return _.select(layer.objects, objectFinder(type));
            }

            // TODO: add console alerts if entities are missing to help debugging
            var player = findObject("player");
            var goal = findObject("treasure");
            var guards = findObjects("guard");

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
        var bgLayer = this.bgLayer;
        var aiLayer = this.aiLayer;

        var player = this.player;
        var guards = this.guards;
        var goal = this.goal;

        var countdown = this.countdown;

        this.camera.update(countdown.remaining);

        player.update(dt, bgLayer);
        _.each(guards, function (guard) {
            guard.update(dt, bgLayer, aiLayer);
        });

        // FIXME: make this happen on an event
        if (player.collide(goal)) {
            goal.open(player);
        }

        countdown.update();

        // FIXME: make this happen on an event
        var props = bgLayer.getProperties(player.x, player.y);
        if (props && props.isexit && props.isexit === "true") {
            if (player.goals > 0) {

                var props = this.map.properties;
                var nextMap = props ? props.nextmap : undefined;

                if (nextMap) {
                    this.playLevel(nextMap);
                } else {
                    console.error("No next map property has been found...!");
                }
            }
        }
    };

    /**
     * Makes a graphical rendering of the game state.
     * @private
     */
    var renderGame = function () {
        var camera = this.camera;
        var screen = this.screen;

        this.map.draw(camera);
        this.countdown.draw(screen.getCtx());

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
            window.requestAnimationFrame(function () {
                mainloop.call(ctx);
            });
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
        var bgLayer = map.findLayer(this.LAYER_BACKGROUND);
        var aiLayer = map.findLayer(this.LAYER_AI);
        var entLayer = map.findLayer(this.LAYER_ENTITIES);

        if (!bgLayer) {
            console.error("No '" + this.LAYER_BACKGROUND + "' layer on map!");
            return;
        }

        if (!aiLayer) {
            console.error("No '" + this.LAYER_AI + "' layer on map!");
            return;
        }
        
        if (!entLayer) {
            console.error("No '" + this.LAYER_ENTITIES + "' layer on map!");
            return;
        }

        var countdown = new Countdown(this.ESCAPE_TIME);
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

        this.bgLayer = bgLayer;
        this.aiLayer = aiLayer;
        this.entitiesLayer = entLayer;

        this.countdown = countdown;

        this.isQuit = false;
        this.lastUpdate = $_.getTicks();
        
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
            this.levelName = (typeof level === "string") ?
                level : this.CUSTOM_LEVEL_NAME;

            newGame.call(this, loadedMap);
            this.dispatchEvent("levelchanged", level);
        }
        
        if (typeof level === "string") {
            map.loadJSON(this.MAP_BASE_DIR +  level, onMapLoad, this);
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
