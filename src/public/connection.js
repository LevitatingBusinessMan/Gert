const socket = io();

socket.on("connection", () => console.log("Connected via socket"))

function forward() {
	socket.emit("forward")
}

function left() {
	socket.emit("left")
}

function right() {
	socket.emit("right")
}

function back() {
	socket.emit("back")
}
