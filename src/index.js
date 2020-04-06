const
port = 3000,

//"click" or "hold"
//Defines the control method
mode = "click",

//If the server should actually power the GPIO pins
dry = false,

//For click mode, time to do action
actionTime = 1000,

express = require("express"),
app = express(),
http = require("http").createServer(app),
io = require("socket.io")(http),
Gpio = require("onoff").Gpio

//State the robot is in
let state = "idle"

//The time that the last input was send
let lastInput = new Date()

//Some logging
console.log("Drymode:", dry)
console.log("Control-mode:", mode)
if (mode == "click")
	console.log("Action-time:", actionTime)

//GPIO stuff
if (!dry) {
	var L1 = new Gpio("6", "out")
	var L2 = new Gpio("13", "out")
	var R1 = new Gpio("19", "out")
	var R2 = new Gpio("26", "out")
}

//setup view engine
app.set("views", __dirname + "/views")
app.set("view engine", "pug")

app.use(express.static(__dirname + "/public"))

app.get("/", (req, res) => {
	res.render("index")
});

io.on("connection", socket => {

	//For the "hold" control method
	//True when socket is actively holding a button
	socket.holding = null

	socket.on("forward", () => {
		console.log("Command: forward")
		state = "forwards"
		lastInput = new Date()

		if (!dry)
			forward()
	})

	socket.on("left", () => {
		console.log("Command: left")
		state = "left"
		lastInput = new Date()
		
		if (!dry)
			left()
	})

	socket.on("right", () => {
		console.log("Command: right")
		state = "right"
		lastInput = new Date()
		
		if (!dry)
			right()
	})

	socket.on("back", () => {
		console.log("Command: back")
		state = "back"
		lastInput = new Date()

		if (!dry)
			back()
	})

});

//Reset movement after a second
if (mode == "click") {
	setInterval(() => {
		if (new Date() - lastInput > actionTime && state != "idle") {
			console.log("Stopping")
			state = "idle"

			//Stop motors
			if (!dry) {
				stop()
			}
		}
	}, 500)
}

function forward() {
	L1.writeSync(0)
	L2.writeSync(1)
	R1.writeSync(1)
	R2.writeSync(0)
}

function left() {
	L1.writeSync(0)
	L2.writeSync(1)
	R1.writeSync(0)
	R2.writeSync(1)
}

function right() {
	L1.writeSync(1)
	L2.writeSync(0)
	R1.writeSync(1)
	R2.writeSync(0)
}

function back() {
	L1.writeSync(1)
	L2.writeSync(0)
	R1.writeSync(0)
	R2.writeSync(1)
}

function stop() {
	L1.writeSync(0)
	L2.writeSync(0)
	R1.writeSync(0)
	R2.writeSync(0)
}

http.listen(port, () => console.log(`Listening on port ${port}`));
