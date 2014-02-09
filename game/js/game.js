/**
 * @author David Serrano <david.ma.serrano@gmail.com>
 */
require(["thief_game"], function (ThiefGame) {
    "use strict";

    var game = new ThiefGame($_("container"), function () {
        game.addEventListener("levelchanged", function (event, level) {
            console.log("Game loaded", level);
        });

        game.playLevel("intro.json");
    });

    var onDragOver = function (e) {
        e.preventDefault();
    };

    var onDrop = function (e) {
        e.preventDefault();

        var file = e.dataTransfer.files[0];
        var reader = new FileReader();

        reader.addEventListener('load', function (e_) {
            var map = JSON.parse(e_.target.result);
            var onQuit = function () {
                game.playLevel(map);
                game.removeEventListener("quit", onQuit);
            }

            game.addEventListener("quit", onQuit());
            game.quit();

        }, false);
        reader.readAsText(file);

        return false;
    };

    document.addEventListener('dragover', onDragOver, false);
    document.addEventListener('drop', onDrop, false);
});
