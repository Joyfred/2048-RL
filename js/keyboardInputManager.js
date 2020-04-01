/*
properties:
1. events = {}

methods:
1. on(event, callback)
2. emit(event, callback)
3. listen()
4. restart(event)
*/

class KeyboardInputManager {
    
    constructor() {
        this.events = {};
        this.listen();
    };

    on = (event, callback) => {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    emit = (event, data) => {
        let callbacks = this.events[event];
        if (callbacks) {
            callbacks.forEach((callback) => callback(data));
        }
    }

    listen = () => {
        let self = this;

        let map = {
            38: 0, // ArrowUp: 0
            39: 1, // ArrowRight: 1
            40: 2, // ArrowDown: 2
            37: 3, // ArrowLeft: 3
        };

        document.addEventListener("keydown", (event) => {
            var hyperKeys = event.altkey ||
                            event.ctrlKey ||
                            event.shiftKey;
            var keyActionMap = map[event.which]
            
            if(!hyperKeys) {
                if(keyActionMap != undefined) {
                    event.preventDefault();
                    self.emit("move", keyActionMap)
                }
            }
        });

        let retry = document.getElementById("retry-button");
        retry.addEventListener("click", this.restart.bind(this));

        let runButton  = document.getElementById('run-button');
        algorithmChoice = document.querySelector('input[name="algorithm"]:checked').value;
        runButton.addEventListener('click', (event) => {
            event.preventDefault();
            self.emit('run');
        });

        let algorithmChoices =  Array.from(document.querySelectorAll('input[name="algorithm"]'));
        algorithmChoices.map(choice => choice.addEventListener("change", event => {
            event.preventDefault();
            algorithmChoice = event.target.value;
        }));

        let animationSpeedSlider = document.getElementById('animation-speed-slider');
        animationSpeedSlider.addEventListener('mouseup', (event) => {
            event.preventDefault();
            let animationSpeed = animationSpeedSlider.value
            animationDelay = 150 - animationSpeed;
        });

        

        // swipe-compatibility
        let gestures = [Hammer.DIRECTION_UP, Hammer.DIRECTION_RIGHT,
                        Hammer.DIRECTION_DOWN, Hammer.DIRECTION_LEFT];

        let gameContainer = document.getElementsByClassName("game-container")[0];
        let handler        = Hammer(gameContainer, {
            drag_block_horizontal: true,
            drag_block_vertical: true
          });

        handler.on("swipe", function (event) {
            event.gesture.preventDefault();
            mapped = gestures.indexOf(event.gesture.direction);
        
            if (mapped !== -1) self.emit("move", mapped);
        });
    }

    restart = (event) => {
        event.preventDefault();
        this.emit("restart");
    }

};