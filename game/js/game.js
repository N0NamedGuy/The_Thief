require(["assets",
        "map",
        "countdown",
        "entity",
        "player",
        "guard",
        "goal",
        "input",
        "audio",
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
        $_,
        __) {
    "use strict";

    var framebuffer = document.createElement("canvas");
    var gameCanvas = document.createElement("canvas");
    var bgrender = document.createElement("canvas");
    var quit;
    var input;
    var levelName;

    var camera = {
        offx: undefined,
        offy: undefined,
        scale: 2
    };
        

    function bindEvents() {

        function onResize(e) {
            var w = 640, h = 480;
            var style = gameCanvas.style;

            framebuffer.width = gameCanvas.width = Math.min(w / camera.scale,
                window.innerWidth / camera.scale);
            framebuffer.height = gameCanvas.height = Math.min(h / camera.scale,
                window.innerHeight / camera.scale);

            style.left = ((window.innerWidth - 
                    (gameCanvas.width * camera.scale)) / 2) + "px";

            style.width = (gameCanvas.width * camera.scale) + "px";
            style.height = (gameCanvas.height * camera.scale) + "px";
        }

        window.addEventListener("resize", onResize, true);
        onResize();
    }

    function loadLevel(filename, callback) {
        quit = true;

        var map = new Map();
        map.loadJSON("maps/" + filename, function (map) {
            levelName = filename;
            if (typeof callback === "function") callback();
            newGame(map);
        });
    }

    function newGame(map) {
        // Preload some stuff, so we don't need to ask everytime where stuff is
        var outCtx = gameCanvas.getContext('2d');
        var fbCtx = framebuffer.getContext('2d');

        var bgLayer = map.findLayer("background");
        var aiLayer = map.findLayer("ai");
        var entLayer = map.findLayer("entities");
        
        var lastUpdate;

        var player = {};
        var goal = {};
        var guards = [];

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
                    }
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
                    var guard = new Guard(guard_, player, map, entities);

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
                console.log("Augmented layer:", layer);

                player.addEventListener("step", function () {
                    Audio.play("step");
                });

                if (callback) callback();
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
            /* Update camera */
            var toFollow = {
                x: player.x,
                y: player.y
            };
            var remaining = countdown.remaining;
            toFollow.x += (Math.sin(remaining) * 16);
            toFollow.y += (Math.cos(remaining) * 16);

            // Thanks Aru!
            if (camera.tempx && camera.tempx) {
                camera.tempx = ((camera.tempx * 5 + toFollow.x) / 6);
                camera.tempy = ((camera.tempy * 5 + toFollow.y) / 6);
            } else {
                camera.tempx = toFollow.x;
                camera.tempy = toFollow.y;
            }

            camera.offx = ((gameCanvas.width / 2) - camera.tempx);
            camera.offy = ((gameCanvas.height / 2) - camera.tempy);
            
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
            fbCtx.clearRect(0, 0, framebuffer.width, framebuffer.height); 

            map.draw(camera, fbCtx);
            
            countdown.render(fbCtx);

            outCtx.clearRect(0, 0, screen.width, screen.height); 
            outCtx.drawImage(framebuffer, 0, 0);
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
            outCtx.imageSmoothingEnable = false;
            fbCtx.imageSmoothingEnable = false;

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
                input = new Input(gameCanvas, camera, player);
                input.bindEvents();
                mainloop();
            });
        }

        init();
    }

    bindEvents();
    levelName = $_.getParameterByName("map");

    levelName = (levelName === "") ? "intro.json" : levelName;
    $_("container").appendChild(gameCanvas);
    
    Assets.load(function () {
        Audio.load(Assets);
        loadLevel(levelName);
    });
});
