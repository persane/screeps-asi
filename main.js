var lib = require('lib');
var creeps = require('creeps');
var ai = require('ai');

if(Game.time % 10 === 0) {
   ai.tick();
}

for(var name in Game.creeps) {
	var creep = Game.creeps[name];

	if(creep.memory.task == 'harvester') {
		creeps.harvester(creep);
	}
	else if(creep.memory.task == 'filler') {
		creeps.filler(creep);
	}

	else if(creep.memory.task == 'builder') {
	    creeps.builder(creep);
	}
	
	else if(creep.memory.role == 'guard') {
    	var targets = creep.room.find(FIND_HOSTILE_CREEPS);
    	if(targets.length) {
    		creep.moveTo(targets[0]);
    		creep.attack(targets[0]);
    	}
    }
	
}

