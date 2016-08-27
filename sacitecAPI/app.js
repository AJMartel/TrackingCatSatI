
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

//Serial tools
var serialport = require('serialport')
var horaFormat = function(horaString){
	//054920.000
	return {
		 horas: horaString.substr(0,2)
		,minutos: horaString.substr(2,2)
		,segundos: horaString.substr(4,2)
	};
}

var latlonFormat = function(gprmcObj){
	var lat = parseFloat(gprmcObj.lat.substr(2,gprmcObj.lat.length)) / 60 + parseInt(gprmcObj.lat.substr(0,2));
	var lon = parseFloat(gprmcObj.lon.substr(3,gprmcObj.lon.length)) / 60 + parseInt(gprmcObj.lon.substr(0,3));

	if(gprmcObj.clon == 'W'){
		lon = lon * -1;
	}
	if(gprmcObj.clat == 'S'){
		lat = lat * -1;
	}

	return {
		 lat: lat
		,lon: lon
		,hora: horaFormat(gprmcObj.hora)
		,velocidad: parseFloat(gprmcObj.vel) * 1.852 //Velocidad de nudos a Km
	}
}

var gprmcParse = function(gprmcString){
	var items = gprmcString.split(',');
	return {
		 id:  items[0]
		,hora: items[1]
		,estado: items[2]
		,lat: items[3]
		,clat: items[4]
		,lon: items[5]
		,clon: items[6]
		,vel: items[7]
		,curso: items[8]
		,fecha: items[9]
	}
}

var port = new serialport('/dev/cu.usbmodem1411', {
	 baudrate: 57600
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
		if( line.search("GPRMC") == 1 ) {
			var gprmcObj = gprmcParse(line);
			var position = latlonFormat(gprmcObj);
			var pos = {
				 lat: position.lat
				,lng: position.lon
			};
			socket.emit('coords:gps', {
				 latlng: pos
				,hh: position.hora.horas
				,mm: position.hora.minutos
				,ss: position.hora.segundos
			});
		}
	});

});


server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
