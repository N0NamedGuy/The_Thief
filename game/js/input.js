define(["lib/util"], function ($_) {
    "use strict";

    var actions = {
        "up": false,
        "down": false,
        "left": false,
        "right": false
    };

    var keys = {
        // WASD
        87: "up",
        65: "left",
        83: "down",
        68: "right",

        // Arrows
        38: "up",
        37: "left",
        40: "down",
        39: "right",

        // ZQSD
        90: "up",
        81: "left"
    };

    var Input = function (canvas, camera, player) {
        this.canvas = canvas;
        this.camera = camera;
        this.pointerDown = false;
        this.player = player;

        this.pointer = undefined;
        this.actions = Object.create(actions);
    };

    Input.prototype.updatePointer = function(ev) {
        var off = this.canvas.getBoundingClientRect();
        var cam = this.camera;

        var offset = {
            left: ev.pageX - off.left,
            top: ev.pageY - off.top
        };

        this.pointer = {
            x: (offset.left / cam.scale) - cam.offx,
            y: (offset.top / cam.scale) - cam.offy
        };
    };

    Input.prototype.onMouse = function (e) {
        e.preventDefault();

        if (e.type === "mousedown") {
            this.pointerDown = true;
        } else if (e.type === "mouseup") {
            this.pointerDown = false;
            return false;
        }

        if (this.pointerDown) this.updatePointer(e);
        return false;
    };

    Input.prototype.onTouch = function (e) {
        e.preventDefault();

        var touches = e.changedTouches;
        if (touches.length != 1) {
            return false;
        }
        var touch = touches[0];
        this.updatePointer(touch);

        return false;
    };

    Input.prototype.onKey = function (e) {
        e.preventDefault();

        var action = keys[e.keyCode];
        if (action) {
            this.actions[action] = (e.type === "keydown");
        }
    };

    Input.prototype.unbindEvents = function (e) {
        var canvas = this.canvas;

        canvas.removeEventListener("mousedown",
                $_.decorateEvent(this, this.onMouse), true);
        canvas.removeEventListener("mouseup",
                $_.decorateEvent(this, this.onMouse), true);
        canvas.removeEventListener("mousemove",
                $_.decorateEvent(this, this.onMouse), true);

        canvas.removeEventListener("touchmove",
                $_.decorateEvent(this, this.onTouch), true);
        canvas.removeEventListener("touchend",
                $_.decorateEvent(this, this.onTouch), true);
        canvas.removeEventListener("touchstart",
                $_.decorateEvent(this, this.onTouch), true);

        window.removeEventListener("keydown",
                $_.decorateEvent(this, this.onKey), true);
        window.removeEventListener("keyup",
                $_.decorateEvent(this, this.onKey), true);
    };

    Input.prototype.bindEvents = function (e) {
        var canvas = this.canvas;

        canvas.addEventListener("mousedown",
                $_.decorateEvent(this, this.onMouse), true);
        canvas.addEventListener("mouseup",
                $_.decorateEvent(this, this.onMouse), true);
        canvas.addEventListener("mousemove",
                $_.decorateEvent(this, this.onMouse), true);

        canvas.addEventListener("touchmove",
                $_.decorateEvent(this, this.onTouch), true);
        canvas.addEventListener("touchend",
                $_.decorateEvent(this, this.onTouch), true);
        canvas.addEventListener("touchstart",
                $_.decorateEvent(this, this.onTouch), true);

        window.addEventListener("keydown",
                $_.decorateEvent(this, this.onKey), true);
        window.addEventListener("keyup",
                $_.decorateEvent(this, this.onKey), true);
    };

    Input.prototype.process = function (dt) {
        var pointer = this.pointer;

        if (this.pointer) {
            this.player.setTarget(pointer.x, pointer.y);
            if (!this.pointerDown) this.pointer = undefined;
        } else {
            this.player.moveRelative(
                (this.actions.left ? -1 : this.actions.right ? 1 : 0) * dt,
                (this.actions.up ? -1 : this.actions.down ? 1 : 0) * dt
            );
        }
    };

    return Input;
});
