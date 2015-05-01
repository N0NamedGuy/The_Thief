define(["lib/util", "underscore/underscore"], function (Util) {
    "use strict";
    var imageAssets = {
        alerted: "gfx/alert.png"   
    };

    var audioAssets = {
        blip: {
            ogg: "sfx/blip.ogg",
            mpeg: "sfx/blip.mp3"
        },
        
        step: {
            ogg: "sfx/step.ogg",
            mpeg: "sfx/step.mp3"
        },

        timeup: {
            ogg: "sfx/timeup.ogg",
            mpeg: "sfx/timeup.mp3"
        },

        goal: {
            ogg: "sfx/goal.ogg",
            mpeg: "sfx/goal.mp3"
        },

        hit: {
            ogg: "sfx/hit.ogg",
            mpeg: "sfx/hit.mp3"
        },

        alerted: {
            ogg: "sfx/alert.ogg",
            mpeg: "sfx/alert.mp3"
        }
    };

    var Assets = {};

    var loadImages = function (pathsObj, cb, ctx) {
        var pairs = _.pairs(pathsObj);

        return Util.loadAsynch(pairs, function (pair, loadedfun) {
            var img = new Image();
            var ret = [pair[0], img];
            img.onload = loadedfun;
            img.src = pair[1];

            return ret;
        }, cb, ctx);
    };

    var loadAudio = function (pathsObj, cb, ctx) {
        var pairs = _.pairs(pathsObj);

        var ret = _.map(pairs, function (pair) {
            var audio = new Audio();
            var ret = [pair[0], audio];

            _.each(pair[1], function (path, type) {
                if (audio.canPlayType('audio/' + type)) {
                    var source = document.createElement("source");
                    source.src = path;
                    source.type = 'audio/' + type;
                    audio.appendChild(source);
                    return false;
                }
            });

            return [pair[0], audio];
        });

        $_.callback(cb, ctx, [ret]);
    };

    Assets.load = function (cb, ctx) {
        function imageLoader(doneFunc) {
            loadImages.call(Assets, imageAssets, function (loaded) {
                Assets.images = Util.makeMap(loaded);
                doneFunc();
                return true;
            }, ctx);
        }

        function audioLoader(doneFunc) {
            loadAudio.call(Assets, audioAssets, function (loaded) {
                Assets.audio = Util.makeMap(loaded);
                doneFunc();
                return true;
            });
        }

        Util.runParallel([imageLoader, audioLoader], cb, ctx);
    };

    return Assets;
});
