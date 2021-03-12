const http = require('http');
const socketIO = require('socket.io');
const express = require('express');
const app = express();
const server = http.createServer(app);
const io = socketIO(server); 
var cookieParser = require('cookie-parser');
var cors = require('cors');

const mqtt = require("mqtt");
var Topic_list = [
  'left', 
  'right', 
  'front', 
  'back', 
  'top', 
  'bottom', 
  'AutoPilotMode', 
  'joyRightX',
  'joyRightY',
  'joyLeftX',
  'joyLeftY'
]; //subscribe to all topic
const HOST = "mqtt://xxx.xxx.xxx:xxxx";
var PORT = process.env.PORT || 8083;


const OPTIONS = {
  clean: true,
  keepalive: 50000,
  clientId: `mqtt_${Math.random().toString(16).slice(3)}`,
  username: "NetworkDrone",
  password: "admin",
};

const client = mqtt.connect(HOST, OPTIONS);
client.on('connect', mqtt_connect);
client.on('message', mqtt_messageReceived);
client.on('reconnect', mqtt_reconnect);
client.on('error', function(err){
  console.log(`Can't connect: ${err}`);
  process.exit(1)
}); //wrong port or the wrong address no error is generated

app.get("/", (req, res) => {
  res.send("Server is running!");
});


function mqtt_connect(){
  client.subscribe(Topic_list, mqtt_subscribe);
}

function mqtt_subscribe(err, granted){
  console.log("Subscribed to " + Topic_list);
  if(err){
      console.log(err);
  }
}

function mqtt_messageReceived(topic, message){
  console.log(`subscribe from "${topic}" topic`, 'message = ' + message);
  let socket = require('socket.io-client')(`http://192.168.101.194:8083`)
  //myplace2 wifi: http://192.168.101.194:8083

  if(topic == "left"){
    var _left = message.toString();
    socket.emit('incomingLeft', _left);
  } 
  else if(topic == "right"){
    var _right = message.toString();
    socket.emit('incomingRight', _right);
  } 
  else if(topic == "front"){
    var _front = message.toString();
    socket.emit('incomingFront', _front);
  } 
  else if(topic == "back"){
    var _back = message.toString();
    socket.emit('incomingBack', _back);
  } 
  else if(topic == "top"){
    var _top = message.toString();
    socket.emit('incomingTop', _top);
  } 
  else if(topic == "bottom"){
    var _bottom = message.toString();
    socket.emit('incomingBottom', _bottom);
  } 
  else {
    message = '';
  }

io.on('connection', socket => {
  // console.log('User connected with socket');

  socket.on('incomingLeft', (_left) => {
    socket.broadcast.emit('outgoingLeft', {num: _left});
    console.log(`left data socket: ${_left}`);
  });

  socket.on('incomingRight', (_right) => {
    socket.broadcast.emit('outgoingRight', {num: _right});
  });

  socket.on('incomingFront', (_front) => {
    socket.broadcast.emit('outgoingFront', {num: _front});
  });

  socket.on('incomingBack', (_back) => {
    socket.broadcast.emit('outgoingBack', {num: _back});
  });
  
  socket.on('incomingTop', (_top) => {
    socket.broadcast.emit('outgoingTop', {num: _top});
  });

  socket.on('incomingBottom', (_bottom) => {
    socket.broadcast.emit('outgoingBottom', {num: _bottom});
  });

  /* socket.setMaxListeners(10000000); */
})
};

function mqtt_reconnect(err){
  console.log('Reconnect MQTT');
  if(err){
      console.log(err);
  }
  
  client = mqtt.connect(HOST, OPTIONS);
};

/* 
  Received data from mobile then sent to MQTT server
*/
io.on('connection', socket => {
  // console.log(`connected with socket, Receving data from mobile`);

  socket.on('Autopilot data', (data) => {
    client.publish('AutoPilotMode', data);
  });

  socket.on('rightX data', (joystick_rightX) => {
    client.publish('joyRightX', joystick_rightX);
  })

  socket.on('rightY data', (joystick_rightY) => {
    client.publish('joyRightY', joystick_rightY);
  })

  socket.on('leftX data', (joystick_leftX) => {
    client.publish('joyLeftX', joystick_leftX);
  })

  socket.on('leftY data', (joystick_leftY) => {
    client.publish('joyLeftY', joystick_leftY);
  })

  socket.on('disconnect', () => console.log('****Mobile client disconnected!'));
  socket.setMaxListeners(10000000);
});

app.use(cookieParser());
app.use(cors());

server.listen(PORT, () => console.log(`Listening on port ${PORT}`));

module.exports = app;
