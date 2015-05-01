define(["lib/util", "lib/listener", "underscore/underscore"], function (Util, listener) {
    "use strict";

    var Countdown = function (secs) {
        this.startTime = undefined;
        this.failed = false;
        this.remaining = 0;
        this.timeout = this.lastsecs = secs;
    };

    listener(Countdown);

    Countdown.prototype.reset = function () {
        this.startTime = undefined;
        this.failed = false;
        this.lastsecs = this.timeout;
    };
    
    Countdown.prototype.start = function () {
        this.startTime = this.curTime = Util.getTicks();
        this.failed = false;
    };

    Countdown.prototype.update = function () {
        if (!this.startTime) return;

        var curTime = Util.getTicks();
        var diff = (this.timeout * 1000) - (curTime - this.startTime);

        var secs = Math.floor(diff / 1000);
        var cents = Math.floor(diff / 10) % 100;
        this.str = "00:" + 
            (secs < 10 ? "0" : "") + secs + ":" +
            (cents < 10 ? "0" : "") + cents; 

        if (secs != this.lastsecs) {
            this.lastsecs = secs;
            this.dispatchEvent("tick", {
                time: diff,
                timeStr: this.str
            });
        }

        if (diff <= 0) {
            diff = 0;
            this.failed = true;
            this.str = "00:00:00";
            this.dispatchEvent("timeup");
        }

        this.remaining = diff;
    };

    Countdown.prototype.draw = function (ctx) {
        if (!this.startTime) return;

        ctx.save();
        ctx.font = "bold 12pt monospace";
        ctx.fillText(this.str, 10, 20);
        ctx.restore();
    };

    return Countdown;
});
