
class ShootyController {

    constructor(object) {
        this.parent = object.parent;
        this.color = object.color;
        this.bulletColor = object.bulletColor;
        this.cannon = null;
        loadCanvas(this.parent, this.color, this.bulletColor, this);
    }
}

function loadCanvas(parent, cannonColor, bulletColor, shooty) {

    let canvas = document.createElement('canvas');
    let rect = parent.getBoundingClientRect();
    parent.appendChild(canvas);

    canvas.animation = false;
    canvas.class = "cannonballCanvas";
    canvas.style.x = rect.x + 1;
    canvas.style.y = rect.y + 1;
    canvas.height = rect.height - 2;
    canvas.width = rect.width - 2;
    canvas.style.zIndex = 1000;
    canvas.style.position = "center";
    canvas.clicked = false;
    canvas.bullets = [];
    canvas.mouseIn = false;
    canvas.mousePos = {
        x: 0,
        y: 0
    }

    let canvasDimentionRectangle = canvas.getBoundingClientRect();

    canvas.addEventListener("mousedown", (event) => {
        let context = canvas.getContext("2d");
        getMousePos(event);
        canvas.clicked = true;
        canvas.mouseIn = true;
        if (shooty.cannon !== null) {
            if ((shooty.cannon.xpos + shooty.cannon.radius >= canvas.mousePos.x) &&
                (shooty.cannon.xpos - shooty.cannon.radius <= canvas.mousePos.x) &&
                (shooty.cannon.ypos + shooty.cannon.radius >= canvas.mousePos.y) &&
                (shooty.cannon.ypos - shooty.cannon.radius <= canvas.mousePos.y)) {
                context.clearRect(shooty.cannon.xpos - shooty.cannon.radius,
                    shooty.cannon.ypos - shooty.cannon.radius, shooty.cannon.radius * 2,
                    shooty.cannon.radius * 2);

                shooty.cannon = null;

            }
            else {
                const interval = setInterval(() => {
                    fireBullets(bulletColor, canvas.mousePos, { x: shooty.cannon.xpos, y: shooty.cannon.ypos });
                    if (!canvas.clicked || !canvas.mouseIn) {
                        clearInterval(interval);
                    }
                }, 10);

            }
        }
        else {
            let cannon = new Cannon(canvas.mousePos.x, canvas.mousePos.y, 20, cannonColor);
            shooty.cannon = cannon;
            cannon.draw(context);
            const interval = setInterval(() => {
                fireBullets(bulletColor, canvas.mousePos, { x: shooty.cannon.xpos, y: shooty.cannon.ypos });
                if (!canvas.clicked || !canvas.mouseIn) {
                    clearInterval(interval);
                }
            }, 10);

            //I chose to call the animator here to ligten the load on the browser
            //meaning i can call it here and then shut it down when there are no more elements on the page,
            //the downside is that if you remove a cannon while there are still bullets and initialize another 
            //one the animation will get much faster (multiple calls for the animator), but i thought it was a worthy trade off to avoid having the animator running constantly.

        }
    }, false);

    //canvas.addEventListener("resize", sizeUpdate, false);

    canvas.addEventListener("mouseenter", getMousePos, false);

    //I chose to stop the firing when the mouse is outside the box as well, so I had to change this status variable when the mouse exits the canvas.
    canvas.addEventListener("mouseout", (event) => { canvas.mouseIn = false;}, false);

    canvas.addEventListener("mouseup", (event) => {
        canvas.clicked = false;
    }, false);

    canvas.addEventListener("mousemove", (event) => {
        getMousePos(event);
    }, false);

    function sizeUpdate(event){
        let rect = canvas.parentElement.getBoundingClientRect;
        canvas.style.x = rect.x + 1;
        canvas.style.y = rect.y + 1;
        canvas.height = rect.height - 2;
        canvas.width = rect.width - 2;
        console.log("size updated");
    }

    function fireBullets(color, mousePos, cannonPos) {
        let pos = calculateXY(mousePos, cannonPos);

        if (canvas.clicked === true) {
            let bullet = {
                color: color,
                x: cannonPos.x + pos.x,
                y: cannonPos.y + pos.y,
                vx: pos.x * 0.30,
                vy: pos.y * 0.30,
                angle: pos.angle,
                radius: 2
            };

            canvas.bullets.push(bullet);
            if(!canvas.animation){
                requestAnimationFrame(animate);
                canvas.animation = true;}
        }
    }

    function animate() {
        //loop through the circles array
        let canvasContext = canvas.getContext("2d");

        canvasContext.fillStyle = "#ffffff";
        canvasContext.fillRect(0, 0, canvasDimentionRectangle.width, canvasDimentionRectangle.height);

        if (shooty.cannon !== null) {

            shooty.cannon.draw(canvasContext);
        }

        for (var i = 0; i < canvas.bullets.length; i++) {

            canvasContext.fillStyle = canvas.bullets[i].color;
            canvasContext.beginPath();
            canvasContext.arc(canvas.bullets[i].x, canvas.bullets[i].y, 2, 0, Math.PI * 2, true);
            canvasContext.fill()

            if (canvas.bullets[i].x - canvas.bullets[i].radius + canvas.bullets[i].vx < 0 ||
                canvas.bullets[i].x + canvas.bullets[i].radius + canvas.bullets[i].vx > canvasDimentionRectangle.width ||
                canvas.bullets[i].y + canvas.bullets[i].radius + canvas.bullets[i].vy > canvasDimentionRectangle.height ||
                canvas.bullets[i].y - canvas.bullets[i].radius + canvas.bullets[i].vy < 0) {
                canvas.bullets.splice(i, 1);
            }
            else {
                canvas.bullets[i].x += canvas.bullets[i].vx
                canvas.bullets[i].y += canvas.bullets[i].vy
            }
        }
        //this condition and everything below it (the else) are here only because we want to stop the animation when there is nothing to animate.
        if (shooty.cannon !== null || canvas.bullets.length > 0) {
            requestAnimationFrame(animate);
        }
        else {
            canvasContext.fillStyle = "#ffffff";
            canvasContext.fillRect(0, 0, canvasDimentionRectangle.width, canvasDimentionRectangle.height);
                canvas.animation = false;
        }
    }

    function getMousePos(event) {
        var rect = canvas.getBoundingClientRect();
        canvas.mouseIn = true;
        canvas.mousePos = {
            x: event.x - rect.left,
            y: event.y - rect.top
        };
    }

    function calculateXY(mousePos, cannonPos) {
        var angle = Math.atan2(cannonPos.y - mousePos.y, cannonPos.x - mousePos.x);

        return {
            x: Math.floor(20 * Math.cos(angle) * -1),
            y: Math.floor(20 * Math.sin(angle) * -1),
            angle: angle
        }
    }

    function onMouseUpdate(event) {
        canvas.mousePos.x = event.x;
        canvas.mousePos.y = event.y;
        console.log(x, y);
    }

    //final comment, here is where i would call the animator if i didnt go with the second approach.

}


class Cannon {
    constructor(xpos, ypos, radius, color) {
        this.xpos = xpos;
        this.ypos = ypos;
        this.radius = radius;
        this.color = color;
    }

    draw(context) {
        context.beginPath();
        context.arc(this.xpos, this.ypos, this.radius, 0, 2 * Math.PI, false);
        context.fillStyle = this.color; 
        context.fill();
    }
}

let myshooty = new ShootyController({ 
    'parent': document.querySelector('.testdiv'), 
    'color': 'red', 
    'bulletColor': '#800' 
});

let myshooty2 = new ShootyController({ 
    'parent': document.querySelector('.testdiv2'), 
    'color': 'blue', 
    'bulletColor': '#008' 
});