function updateSystem() { // TODO: FFS use a view for this
	fetch('/system.json').then(function(res){
		res.json().then(function(data){
			document.querySelector("#uptime").innerHTML = "Uptime: " + data.uptime.Days + " : " + data.uptime.Hours + " : " + data.uptime.Minutes;
			//document.querySelector("#cpu").innerHTML = "cpu " + data.cpu[0].model + data.cpu[0].speed
			// document.querySelector("#memory").innerHTML = "mem " + data.memory.free + " / " + data.memory.total + " (" + Math.floor(data.memory.percent) + " %) "
			// document.querySelector("#host").innerHTML = "host " + data.host
			//document.querySelector("#system").innerHTML = "sys " + data.system
		})
	}).catch(console.error);
}