define(["lib/util", "lib/underscore"], function (Util) {
    "use strict";

    var Countdown = function (secs) {
        this.startTime = undefined;
        this.failed = false;
        this.remaining = 0;
        this.lastsecs = secs;
    };

    Countdown.prototype.reset = function () {
        this.startTime = undefined;
        this.failed = false;
    };
    
    Countdown.prototype.start = function () {
        this.startTime = this.curTime = Util.getTicks();
        this.failed = false;
    };

    Countdown.prototype.update = function () {
        if (!this.startTime) return;

        var curTime = Util.getTicks();
        var diff = (10000) - (curTime - this.startTime);

        var secs = Math.floor(diff / 1000);
        var cents = Math.floor(diff / 10) % 100;
        this.str = "00:" + 
            (secs < 10 ? "0" : "") + secs + ":" +
            (cents < 10 ? "0" : "") + cents; 

        if (secs != this.lastsecs) {
            // TODO: event tick
            this.lastsecs = secs;
        }

        if (diff <= 0) {
            diff = 0;
            this.failed = true;
            this.str = "00:00:00";
        }

        this.remaining = diff;
    };

    Countdown.prototype.render = function (ctx) {
        if (!this.startTime) return;

        ctx.save();
        ctx.font = "bold 12pt monospace";
        ctx.fillText(this.str, 10, 20);
        ctx.restore();
    };

    return Countdown;
});