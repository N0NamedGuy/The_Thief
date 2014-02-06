require(["thief_game"], function (ThiefGame) {
    "use strict";

    var game = new ThiefGame($_("container"), function () {
        game.playLevel("intro.json", function () {
            console.log("Game loaded");
        });
    });

});
