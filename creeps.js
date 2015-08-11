var _ = require('lodash');
var creeps = function() {};
module.exports = creeps;

Creep.prototype.getSource = function() {
    return this.memory.source ? Game.getObjectById(this.memory.source) : null;
};

Creep.prototype.getTarget = function() {
    return this.memory.target ? Game.getObjectById(this.memory.target) : null;
};

Creep.prototype.getCarryFree = function() {
    return (this.carryCapacity - this.carry.energy);
};

// MOVE: 50
// WORK: 100
// CARRY: 50
// ATTACK: 80
// RANGED_ATTACK: 150
// HEAL: 250
// TOUGH: 10

creeps.units = {
    'small_worker': {'body': [WORK, CARRY, MOVE, MOVE]}, // 250
};

creeps.tasks = {
    'harvester': {},
    'filler': {},
    'builder': {},
};

creeps.create = function(spawn, unitName, taskName) {
   
    if(!creeps.isValidUnit(unitName)) {
        console.log('Invalid unit name');
        return null;
    }
    
    if(taskName !== undefined && !creeps.isValidTask(taskName)) {
        console.log('Invalid task name');
        return null;
    }

    var unit = creeps.units[unitName];
    var task = taskName !== undefined ? creeps.tasks[taskName] : null;
    var body = unit.body;
    
    var res = spawn.canCreateCreep(body);
    
    if(res !== OK) { 
        //console.log('Spawn can not create this creep (error: ' + res + ')');
        return null;
    }
    
    var memory = {};
    
    if(taskName) {
        memory.task = taskName;
        memory.taskDefault = taskName;
        
        /*
        _.forOwn(task.memory, function(value, key) {
            memory[key] = value;
        });
        */
    }
    
    return spawn.createCreep(body, undefined, memory);
};

creeps.harvester = function(creep) {
    
    if(!creep.memory.source) {
    	var source = creep.pos.findClosest(FIND_SOURCES);
    	if(source) {
    		creep.memory.source = source.id;
    	}
    }
    
    if(!creep.memory.target) {
    	var target = creep.pos.findClosest(FIND_MY_SPAWNS);
    	if(target) {
    		creep.memory.target = target.id;
    	}
    }
   
	if(creep.carry.energy < creep.carryCapacity) {
		var source = creep.getSource();
		if(source) {
		    creep.moveTo(source);
		    creep.harvest(source);
		}
	} else {
	    var target = creep.getTarget();
		if(target) {
		    creep.moveTo(target);
		    creep.transferEnergy(target);
		}
	}
};

creeps.filler = function(creep) {
	
	if(!creep.memory.source) {
    	var source = creep.pos.findClosest(FIND_MY_SPAWNS);
    	if(source) {
    		creep.memory.source = source.id;
    	}
    }
	
	if(!creep.memory.target) {
    	var target = creep.room.controller;
    	if(target) {
    		creep.memory.target = target.id;
    	}
    }
	
    if(creep.carry.energy === 0) {
		var source = creep.getSource();
		if(source) {
    		
    		if(creep.pos.isNearTo(source)) {
    			//var amount = creep.getCarryFree();
                if(source.mayDrainEnergy()) {
                    source.transferEnergy(creep);    
                }
    		} else{
                creep.moveTo(source);    
    		}    
		}
	} else {
	    var target = creep.getTarget();
	    if(target) {
		    creep.moveTo(target);
		    creep.upgradeController(target);
	    }
	}  
};

creeps.builder = function(creep) {
    if(creep.carry.energy == 0) {
        var spawn = Game.spawns.Spawn1;
		creep.moveTo(spawn);
		if(spawn.mayDrainEnergy()) {
            spawn.transferEnergy(creep);
		}
	}
	else {
		var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
		if(targets.length) {
		
            if(creep.pos.isNearTo(targets[0])) {
                creep.build(targets[0]);    
            } else {
                creep.moveTo(targets[0]);    
            }

		}
	}
    
};

// Helper

creeps.isValidUnit = function(unit) {
    return _.has(creeps.units, unit);
};

creeps.isValidTask = function(task) {
    return _.has(creeps.tasks, task);
};