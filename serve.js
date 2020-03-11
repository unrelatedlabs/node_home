var temp = require('./temperature.js')

var thermostat = require('./thermostat.js')
var lazybone = require("./lazybone.js")
var wemo_heater = require("./wemo_heater.js")


var names = {
	"2600032D":"bedroom",
	"57A7993C":"living_room"
}

function deviceName(uuid){
	return names[uuid] || uuid
}


var firebase = require("firebase");

// Initialize Firebase
// TODO: Replace with your project's customized code snippet
var config = {
    apiKey: "AIzaSyC0Vqb-oTpl1oe6dW2ZzZ07xBlc8NIC3YQ",
    authDomain: "iotdata.firebaseapp.com",
    databaseURL: "https://iotdata.firebaseio.com",
    storageBucket: "firebase-iotdata.appspot.com",
    messagingSenderId: "462881763016"
};

firebase.initializeApp(config);


function updateStatus(name,status) {
  firebase.database().ref('devices/' + name ).set(status);
  firebase.database().ref('temperature_log/' + name ).push(status)
}

temp.update(function(status){
	console.log('update', status)
	//updateStatus(status.device,status)
})

function setupRoom(name,thermometer_id,heater_address){

	var heater = {switch: () => console.log("unimplemented " + name) }

	if( heater_address && heater_address.indexOf("lazybone:")==0 ){
		heater = lazybone.init(heater_address.replace('lazybone://',''));
	}	

	if (heater_address && heater_address.indexOf("wemo:") == 0) {
		heater = wemo_heater.init(heater_address.replace('wemo:', ''));
	}	

	var thermostatInstance = thermostat.init(name,heater)

	temp.update(function(status){
		try{
		if( status.device == thermometer_id ){
			console.log('Temperature sensor ' + name,status)
			
			firebase.database().ref('devices/' + name ).set(status);
  			firebase.database().ref('temperature_log/' + name ).push(status)
			console.log('Temperature updated to firebase ')
			thermostatInstance.updateStatus(status)
		}}catch(e){
			console.log("Temperateure update problem",e);
		}
	})

	var starCountRef = firebase.database().ref('settings/'+name);
	starCountRef.on('value', function(snapshot) {
	  console.log("settings " + name,snapshot.val());
	  thermostatInstance.updateSettings(snapshot.val())
	});

	var bedroomTemperature = firebase.database().ref("temperature_log/"+name).orderByKey().limitToLast(1)
	bedroomTemperature.on('child_added', function(snapshot) {
	  console.log('temperature ' + name, snapshot.val());
	  thermostatInstance.updateStatus(snapshot.val())
	});

	thermostatInstance.enable()

}

var CronJob = require('cron').CronJob;


function setupSchedule(){
	var joblist = [];

	function updateSchedule(schedule){
		joblist.forEach(job => {
			job.stop();
		});

		for (const key in schedule) {
			try{
				const entry = schedule[key];
				var seconds = Math.floor(entry.time  % 60)
				var minutes = Math.floor(entry.time/60%60)
				var hours = Math.floor(entry.time / 60 / 60)

				console.log( seconds,minutes,hours,entry);

				var job = new CronJob(seconds + " "+ minutes + " " + hours+ " * * *", function () {
					console.log('Time for',entry);
					if( entry.bedroom ){
						console.log('bedroom', entry.bedroom);
						firebase.database().ref('settings/bedroom/temperature').set(entry.bedroom);
					}
					if (entry.living_room) {
						console.log('living_room', entry.living_room);
						firebase.database().ref('settings/living_room/temperature').set(entry.living_room);
					}
				}, null, true, 'America/Los_Angeles');
				job.start();

				joblist.push(job)
			}catch(e){
				console.log("setupSchedule error",e)
			}
		}
	}

	var schedule = firebase.database().ref('schedule');
	schedule.on('value', function (snapshot) {
		console.log("schedule " , snapshot.val());
		updateSchedule(snapshot.val());
	});

	schedule.once('value', function (snapshot) {
		console.log("schedule ", snapshot.val());
		updateSchedule(snapshot.val());
	});
}

setupRoom('living_room','57A7993C','lazybone://10.0.0.19')
setupRoom('bedroom','2600032D',"wemo:heater")

setupSchedule();

var express = require('express')
var app = express()


app.use('/static', express.static('static'))
app.use('/dash', express.static('dash'))
app.use('/node_modules', express.static('node_modules'))

app.get("/temperature",function(req,resp){
	var living_room = req.param("living_room")
	if( living_room ){
		living_room  = parseFloat(living_room)
		firebase.database().ref('settings/living_room/temperature' ).set(living_room);
	}

	var bedroom_temperature = req.param("bedroom")
	if (bedroom_temperature) {
		bedroom_temperature = parseFloat(bedroom_temperature)
		firebase.database().ref('settings/bedroom/temperature').set(bedroom_temperature);
	}

	console.log("req",req)
	resp.send("ok")
})

app.get("/heat_it_up",function(req,resp){
	var bedroomTemperature = firebase.database().ref("temperature_log/living_room").orderByKey().limitToLast(1)
	bedroomTemperature.once('child_added', function(snapshot) {
		try{
			var temp = snapshot.val().temperature;
			temp += 1.0 - 0.4 // + 1 deg
		  	console.log('setting temperaure to ', temp);
		
			firebase.database().ref('settings/living_room/temperature' ).set(temp);	   
			
			resp.send("ok")
		}catch(e){
			console.error("Ups",e)
			resp.send("Error " + e)
		}

	});
})

app.get("/",function(req,resp){
	resp.send(":)")
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})

