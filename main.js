var lib = require('lib');
var creeps = require('creeps');
var ai = require('ai');

ai.tick();

/**
 * TODO:
 * 
 * - set units without a task into sleep mode
 * - cable: pickup energy from below, when arriving at new location (old energy from dead creep)
 * - new unit: capacitor for long cables
 */

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
	
	else if(creep.memory.task == 'defender') {
		creeps.defender(creep);    	
    }
	
	else if(creep.memory.task == 'mining') {
		creeps.mining(creep);    	
    }
	
	else if(creep.memory.task == 'store') {
		creeps.store(creep);    	
    }
	
	else if(creep.memory.task == 'truck') {
		creeps.truck(creep);    	
    }
	
	else if(creep.memory.task == 'cable') {
		creeps.cable(creep);    	
    }
	
	else if(creep.memory.task == 'plug') {
		creeps.plug(creep);    	
    }
	
}

