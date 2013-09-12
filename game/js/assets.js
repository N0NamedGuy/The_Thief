define(["lib/util"], function (Util) {
    "use strict";
    var imageAssets = {
        alert: "gfx/alert.png"   
    };

    var Assets = function () {};

    Assets.load = function (cb) {
        $_.loadImages(imageAssets, function (loaded) {
            Assets.images = loaded;
            if (typeof cb === "function") cb(); 
        });
    };

    return Assets;
});
