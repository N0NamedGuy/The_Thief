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
        $_,
        listener,
        __) {
    "use strict";

    /*
     * ThiefGame constructor
     *
     * @param container The target container where the game will be rendered
     */
    var ThiefGame = function (container, callback) {
        var camera = new Camera(container, this.SCREEN_W, this.SCREEN_H,
                this.SCREEN_SCALE,
                /* FIXME: make these values constants */
                16, 5, 6);

        var input = new Input(camera);
        
        this.input = input;
        this.camera = camera;
        this.levelName = undefined;

        Assets.load(function() {
            Audio.load(Assets);
            $_.callback(callback, this);
        }, this);
    };

    listener(ThiefGame);

    /********************************************
     * Game "constants" and adjustables are here
     ********************************************/
    ThiefGame.prototype.MAP_BASE_DIR = "maps/";
    ThiefGame.prototype.ENTITIES_FILE = "entities.json";

    ThiefGame.prototype.LAYER_BACKGROUND = "background";
    ThiefGame.prototype.LAYER_AI = "ai";
    ThiefGame.prototype.LAYER_ENTITIES = "entities";
    
    ThiefGame.prototype.ESCAPE_TIME = 9;
    
    ThiefGame.prototype.SCREEN_W = 640;
    ThiefGame.prototype.SCREEN_H = 480;
    ThiefGame.prototype.SCREEN_SCALE = 2;

    ThiefGame.prototype.CUSTOM_LEVEL_NAME = "custom_level";
    
    /********************************************
     * Private functions are here
     ********************************************/

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

            $_.callback(callback, this);
        }, this);
    };
    
    var restartLevel = function () {
        this.player.reset();
        this.goal.reset();
        _.each(this.guards, function (guard) {
            guard.reset();
        });
        this.countdown.reset();
    };

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
                // TODO: add event trigger level change
                this.playLevel(this.map.properties.nextmap);
            }
        }
    };

    var renderGame = function () {
        var camera = this.camera;

        this.map.draw(camera);
        this.countdown.draw(camera.getCtx());

        camera.flip();
    };

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

    var newGame = function (map) {
        var bgLayer = map.findLayer(this.LAYER_BACKGROUND);
        var aiLayer = map.findLayer(this.LAYER_AI);
        var entLayer = map.findLayer(this.LAYER_ENTITIES);

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
     * Plays a certain level
     */
    ThiefGame.prototype.playLevel = function (level, callback) {
        var map = new Map();
        this.map = map;

        this.quit();

        var onMapLoad = function (loadedMap) {
            this.levelName = (typeof level === "string") ?
                level : this.CUSTOM_LEVEL_NAME;

            newGame.call(this, loadedMap);
            $_.callback(callback, this);
        }
        
        if (typeof level === "string") {
            map.loadJSON(this.MAP_BASE_DIR +  level, onMapLoad, this);
        } else if (typeof level === "object") {
            map.load(level, onMapLoad, this);
        }

    };

    ThiefGame.prototype.quit = function () {
        this.isQuit = true;
    };

    return ThiefGame;
});
