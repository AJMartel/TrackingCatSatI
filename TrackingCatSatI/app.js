
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var serialport = require('serialport') //Serial tools

var stringParse = function(recvString){
var items = recvString.split(',');
	return {
		 id:  items[0]
		,temp1: items[1]
		,hum: items[2]
		,temp2: items[3]
		,mx: items[4]
		,my: items[5]
		,mz: items[6]
		,ax: items[7]
		,ay: items[8]
		,az: items[9]
		,gx: items[10]
		,gy: items[11]
		,gz: items[12]
		,lat: items[13]
		,lon: items[14]
	}
}

var port = new serialport('/dev/cu.usbmodem1421', {
//var port = new serialport('COM20', {
	 baudrate: 9600
	,parser: serialport.parsers.readline('\n')
});

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);


io.sockets.on('connection', function(socket){
	socket.on('coords:me', function(data){
		console.log(data);
		socket.broadcast.emit('coords:user', data);
	});

	socket.emit('news', { hello: 'world' });

	port.on('data', function(line){
			var gprmcObj = stringParse(line);
			var pos = {
				 lat: gprmcObj.lat
				,lng: gprmcObj.lon
			};

		socket.emit('coords:gps', {
				 latlng: pos
				//,hh: position.hora.horas
				//,mm: position.hora.minutos
				//,ss: position.hora.segundos
			}); //emit

	//	} // if

	}); //port on

});


server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
