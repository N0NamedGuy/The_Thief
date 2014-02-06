require(["assets",
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
        __) {
    "use strict";

    var quit;
    var input;
    var levelName;

    var width = 640;
    var height = 480;
    var scale = 2;
    var camera = new Camera($_("container"), width, height, scale,
            16, 5, 6);
        
    function loadLevel(filename, callback) {
        quit = true;

        var map = new Map();
        map.loadJSON("maps/" + filename, function (map) {
            levelName = filename;
            $_.callback(callback);
            newGame(map);
        });
    }

    function newGame(map) {
        // Preload some stuff, so we don't need to ask everytime where stuff is
        var bgLayer = map.findLayer("background");
        var aiLayer = map.findLayer("ai");
        var entLayer = map.findLayer("entities");
        
        var lastUpdate;

        var player = {};
        var goal = {};
        var guards = [];
        var alertSprite = {};

        var countdown = new Countdown(9);

        function loadEntities(layer, callback) {
            $_.getJSON("entities.json", function (entities) {

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

                player = findObject("player");
                goal = findObject("treasure");
                var guards_ = findObjects("guard");


                player = new Player(player, map, entities);
                goal = new Goal(goal, map, entities);

                goal.addEventListener("open", function () {
                    countdown.start();
                    Audio.play("goal");
                });

                guards = _.map(guards_, function (guard_) {
                    var guard = new Guard(guard_, player, map,
                        Assets.images["alerted"], entities);

                    guard.addEventListener("alerted", function (e, g) {
                        if (g.alerted) {
                            Audio.play("alerted");
                        }
                    });

                    guard.addEventListener("hit", function () {
                        Audio.play("hit");
                        restartLevel();
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

                camera.setTarget(player);

                $_.callback(callback);
            });
        }

        function restartLevel(layer) {
            player.reset();
            goal.reset();
            _.each(guards, function (guard) {
                guard.reset();
            });
            countdown.reset();
        }

        function processLogic(dt) {
            var remaining = countdown.remaining;
            camera.update(remaining);
            
            player.update(dt, bgLayer);
            _.each(guards, function (guard) {
                guard.update(dt, bgLayer, aiLayer);
            });

            if (player.collide(goal)) {
                goal.open(player);
            }
            
            countdown.update();
            
            /* Check if thief is on exit */
            var props = bgLayer.getProperties(player.x, player.y);
            if (props && props.isexit && props.isexit === "true") {
                if (player.goals > 0) {
                    loadLevel(map.properties.nextmap);
                }
            }
        }
        
        function renderGame() {
            map.draw(camera);
            countdown.draw(camera.getCtx());
            camera.flip();
        }

        function mainloop() {
            var curTime = $_.getTicks();
            var dt = (curTime - lastUpdate) / 60;

            input.process(dt);
            processLogic(dt);
            renderGame();

            lastUpdate = curTime;
            if (!quit) {
                if (window.requestAnimationFrame) {
                    window.requestAnimationFrame(mainloop);
                } else {
                    window.setTimeout(mainloop, 1000 / 60);
                }
            }
        }

        function init() {
            quit = false;
            lastUpdate = $_.getTicks();

            countdown.addEventListener("tick", function () {
                Audio.play("blip");
            });
            
            countdown.addEventListener("timeup", function () {
                if (countdown.failed) {
                    restartLevel();
                    Audio.play("timeup");
                }
            });

            loadEntities(entLayer, function () {
                if (input) {
                    input.unbindEvents();
                }
                input = new Input(camera);
                input.bindEvents();
                mainloop();
            });
        }

        init();
    }

    levelName = $_.getParameterByName("map");

    levelName = (levelName === "") ? "intro.json" : levelName;
    
    Assets.load(function () {
        Audio.load(Assets);
        loadLevel(levelName);
    });
});
