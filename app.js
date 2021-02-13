const http = require('http');
const socketIO = require('socket.io');
const express = require('express');
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
var cors = require('cors')

const mqtt = require("mqtt");
var Topic_list = ['left', 'right', 'front', 'back', 'top', 'bottom', 'Autodata']; //subscribe to all topic
const HOST = "mqtt://qad6be98.en.emqx.cloud:11781";
var PORT = process.env.PORT || 8083;


const OPTIONS = {
  clean: true,
  // keepalive: 0,
  keepalive: 5000,
  reschedulePings: true,
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
  // console.log(`Connect to MQTT status: ${client.connected}`);
  /* client.subscribe('left', mqtt_subscribe);
  client.subscribe('right', mqtt_subscribe);
  client.subscribe('front', mqtt_subscribe);
  client.subscribe('back', mqtt_subscribe);
  client.subscribe('top', mqtt_subscribe);
  client.subscribe('bottom', mqtt_subscribe);
  client.subscribe('Autodata', mqtt_subscribe); */
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
  let socket = require('socket.io-client')(`https://drone-mobile.herokuapp.com/`)

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

  socket.setMaxListeners(10000000);
})
};

function mqtt_reconnect(err){
  console.log('Reconnect MQTT');
  if(err){
      console.log(err);
  }
  
  client = mqtt.connect(HOST, OPTIONS);
};

io.on('connection', socket => {
  // console.log(`connected with socket, Receving data from mobile`);

  socket.on('Autopilot data', (data) => {
    // socket.broadcast.emit("outgoingdata", data);
    console.log(`Socket server Received data from mobile -> ${data}`);

    client.publish('Autodata', data);
  });

  socket.on('disconnect', () => console.log('****Mobile client disconnected!'));
});

app.use(cors())
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));


//dummy data for hardware data
/* let initial_data = 0;
setInterval(function() {
    let nextMin = (initial_data-2)>0 ? initial_data-2 : 2;
    let nextMax = initial_data+5 < 100 ? initial_data+5 : Math.random() * (130 - 5 + 1) + 5;

    left_value = (Math.floor(Math.random() * (nextMax - nextMin + 0.0001) + nextMin)).toString();
    right_value = (Math.floor(Math.random() * (nextMax - nextMin + 0.25) + nextMin)).toString();
    front_value = (Math.floor(Math.random() * (nextMax - nextMin + 0.0254) + nextMin)).toString();
    back_value = (Math.floor(Math.random() * (nextMax - nextMin + 0.412) + nextMin)).toString();
    top_value = (Math.floor(Math.random() * (nextMax - nextMin + 0.3) + nextMin)).toString();
    bottom_value = (Math.floor(Math.random() * (nextMax - nextMin + 1) + nextMin)).toString();

    client.publish('left', left_value, PubOptions);
    client.publish('right', right_value, PubOptions);
    client.publish('front', front_value, PubOptions);
    client.publish('back', back_value, PubOptions);
    client.publish('top', top_value, PubOptions);
    client.publish('bottom', bottom_value, PubOptions);
}, 1000); */

module.exports = app;
