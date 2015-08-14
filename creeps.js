var _ = require('lodash');
require('rooms');
var creeps = function() {};
module.exports = creeps;

var ROOM_WALLS_MAX_HITS = 100;

var directions = {};
directions[TOP_LEFT] = {dx: -1, dy: -1};
directions[TOP] = {dx: 0, dy: -1};
directions[TOP_RIGHT] = {dx: 1, dy: -1};
directions[LEFT] = {dx: -1, dy: 0};
directions[RIGHT] = {dx: 1, dy: 0};
directions[BOTTOM_LEFT] = {dx: -1, dy: 1};
directions[BOTTOM] = {dx: 0, dy: 1};
directions[BOTTOM_RIGHT] = {dx: 1, dy: 1};

var bodyCosts = {};
bodyCosts[MOVE] = 50;
bodyCosts[WORK] = 100;
bodyCosts[CARRY] = 50;
bodyCosts[ATTACK] = 80;
bodyCosts[RANGED_ATTACK] = 150;
bodyCosts[HEAL] = 250;
bodyCosts[TOUGH] = 10;

// Available Units
creeps.units = {};
creeps.units.worker = {};
creeps.units.defender = {};
creeps.units.miner = {};
creeps.units.store = {};
creeps.units.truck = {};
creeps.units.cable = {};
creeps.units.plug = {};
creeps.units.builder = {};
creeps.units.filler = {};

// Available tasks
creeps.tasks = {};
creeps.tasks.harvester = {};
creeps.tasks.builder = {};
creeps.tasks.defender = {};
creeps.tasks.mining = {};
creeps.tasks.store = {};
creeps.tasks.truck = {};
creeps.tasks.cable = {};
creeps.tasks.plug = {};
creeps.tasks.filler = {};

// Defining body of each unit depending on available energy

creeps.units.worker.getBody = function(energyLimit) {
	if(energyLimit <= 300) {
		return [WORK, CARRY, MOVE, MOVE]; // 250
	} else if(energyLimit <= 350) {
		return [WORK, CARRY, CARRY, MOVE, MOVE]; // 300
	} else if(energyLimit <= 500) {
		return [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE]; // 450
	} else if(energyLimit <= 600) {
		return [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE]; // 550
	} else if(energyLimit <= 700) {
		return [WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE]; // 650
	} else if(energyLimit <= 800) {
		return [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE]; // 750
	} else {
		return [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE]; // 750
	}
};

creeps.units.builder.getBody = function(energyLimit) {
	var bodyProgression = [CARRY, WORK, MOVE, CARRY, WORK, MOVE, CARRY, WORK, MOVE, CARRY, 
	                       WORK, MOVE, CARRY, WORK, MOVE];
	var minLength = 3;
	return creeps.calcBody(bodyProgression, minLength, energyLimit);
};

creeps.units.defender.getBody = function(energyLimit) {
	if(energyLimit > 1000) {
		return [TOUGH, TOUGH, MOVE, MOVE, MOVE, ATTACK];
	} else {
		return [TOUGH, TOUGH, MOVE, MOVE, MOVE, ATTACK];
	}
};

creeps.units.miner.getBody = function(energyLimit) {
	var bodyProgression = [CARRY, MOVE, WORK, WORK, WORK, MOVE, WORK, WORK, WORK]; // max: 750
	var minLength = 3;
	return creeps.calcBody(bodyProgression, minLength, energyLimit);	
};

creeps.units.store.getBody = function(energyLimit) {
	var bodyProgression = [MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]; // max: 550
	var minLength = 2;
	return creeps.calcBody(bodyProgression, minLength, energyLimit);
};

creeps.units.truck.getBody = function(energyLimit) {
	var bodyProgression = [CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY]; // max: 450
	var minLength = 2;
	return creeps.calcBody(bodyProgression, minLength, energyLimit);
};

creeps.units.filler.getBody = function(energyLimit) {
	var bodyProgression = [MOVE, CARRY, CARRY, MOVE, CARRY, CARRY, MOVE, CARRY, CARRY]; // max: 450
	var minLength = 2;
	return creeps.calcBody(bodyProgression, minLength, energyLimit);
};

creeps.units.cable.getBody = function(energyLimit) {
	if(energyLimit <= 300) {
		return [CARRY, CARRY, MOVE, MOVE]; // 400
	} else {
		return [CARRY, CARRY, MOVE, MOVE]; // 400
	}
};

creeps.units.plug.getBody = function(energyLimit) {
	var bodyProgression = [MOVE, CARRY, WORK, WORK, MOVE, WORK, WORK, MOVE, WORK, WORK]; // max: 800
	var minLength = 3;
	return creeps.calcBody(bodyProgression, minLength, energyLimit);
};

creeps.calcBody = function(bodyProgression, minLength, energyLimit) {
	var cost = 0;
	var body = [];
	var length = 0;
	var maxLength = bodyProgression.length;
	while(cost + bodyCosts[bodyProgression[length]] <= (energyLimit - 50)) {
		body.push(bodyProgression[length]);
		cost += bodyCosts[bodyProgression[length]];
		length++;
		if(length >= maxLength) {
			break;
		}
	}
	
	if(length < minLength) {
		return null;
	}

	//console.log(body);
	
	return body;	
}

creeps.create = function(spawn, unitName, taskName, energyLimit) {
 
    if(!creeps.isValidUnit(unitName)) {
        console.log('Invalid unit name');
        return null;
    }
    
    if(taskName !== undefined && !creeps.isValidTask(taskName)) {
        console.log('Invalid task name');
        return null;
    }

    var unit = creeps.units[unitName];
    //var task = taskName !== undefined ? creeps.tasks[taskName] : null;
    var body = unit.getBody(energyLimit);
   
    var res = spawn.canCreateCreep(body);
    
    if(res !== OK) { 
        //console.log('Spawn can not create this creep (error: ' + res + ')');
        return null;
    }
    
    var memory = {};
    memory.unit = unitName;
    memory.commands = [];
    
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
    
    var source = creep.getSource();
    var target;
    
    if(creep.room.storage) {
    	target = creep.room.storage;
    } else {
    	target =  creep.getTarget();;
    }
    
    if(!target) {
    	target = creep.pos.findClosest(FIND_MY_SPAWNS);
        creep.setTarget(target);
    }
    
    if(!source && target) {
    	source = target.pos.findClosestByRange(FIND_SOURCES);
    	creep.setSource(source);
    }

    if(!target || !source) {
        return;
    }
    
    var state; // 'harvest' or 'transfer';
    
    var isNearSource = target ? creep.pos.isNearTo(source) : false;
    var isNearTarget = target ? creep.pos.isNearTo(target) : false;
    
    if(isNearSource) {
        state = creep.isCarryFull() ? 'transfer' : 'harvest';
    } else {
        state = creep.carry.energy === 0 ? 'harvest' : 'transfer';
    }
    
    //console.log(state);
    
    if(state === 'harvest') {
        if(isNearSource) {
            creep.harvest(source);
        } else {
            creep.moveTo(source);
        }
    } else if (state === 'transfer') {
        if(isNearTarget) {
            creep.transferEnergy(target);
        } else {
            creep.moveTo(target);
        }
    }
    
};

creeps.builder = function(creep) {
	
	var source;
    var target = creep.getTarget();
    
    if(creep.room.storage) {
    	source = creep.room.storage;
    } else {
    	source = creep.getSource();
    }
     
    if(target === null) {
    	
    	/*
    	if(target === null) {
			target = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter: function(object) {
				return object.structureType === STRUCTURE_EXTENSION && object.energy < object.energyCapacity;
			}});
    	}
    	
    	// If storage is available, check if there are any non full spawns
    	if(target === null) {
	    	if(creep.room.storage) {
	    		target = creep.pos.findClosestByRange(FIND_MY_SPAWNS, {filter: function(object) {
	                return object.energy < object.energyCapacity;
	            }});	
	    	}
    	}
    	*/
    	
         if(target === null) {
			target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES, {filter: function(object) {
				return (object.my && object.progress > 0 && (object.progressTotal - object.progress) > 50);
			}});
         }
        
        if(target === null) {
        	target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES, {filter: function(object) {
        		return object.my;
        	}});
        }
        
        if(target === null && creep.room.controller.level <= 1) {
            target = creep.room.controller;    
        }
        
        if(target === null) {
        	target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: function(object) {
                    return object.structureType === STRUCTURE_ROAD && object.hits/object.hitsMax <= 0.5;
                }
            });
        }
        
        if(target === null) {
        	target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: function(object) {
                    return (object.structureType === STRUCTURE_WALL || object.structureType === STRUCTURE_RAMPART) && object.hits < ROOM_WALLS_MAX_HITS && object.hitsMax > 1;
                }
            });
        }
        
        creep.setTarget(target);
    }
  
    if(!source && target) {
        source = target.pos.findClosestByRange(FIND_MY_SPAWNS);
        creep.setSource(source);
    }

    if(creep.carry.energy == 0) {
    	
    	if(creep.room.storage) {
    		creep.moveTo(creep.room.storage.pos);
    		creep.room.storage.transferEnergy(creep);
    		creep.resetTarget(target);
    		return;	
    	}
    	
        var source = creep.getSource();
        if(source) {
    		creep.moveTo(source);
    		if(source.mayDrainEnergy()) {
                source.transferEnergy(creep);
                creep.resetTarget(target);
    		}
        }
	} else {
		var target = creep.getTarget();
		if(target) {
            if(creep.pos.isNearTo(target)) {
            	
            	var type = target.constructor.name;
            	
            	if((type === 'Structure' && target.structureType === STRUCTURE_EXTENSION) || type === 'Spawn') {
        	        var res = creep.transferEnergy(target);    
        	        if(res == ERR_FULL) {
        	            creep.setTarget(null);
        	        }
        	    } else if(type === 'Structure' && target.structureType === STRUCTURE_CONTROLLER) {
        	        creep.upgradeController(target);
        	    } else if(type === 'Structure' && target.structureType === STRUCTURE_ROAD) {
        	    	if(target.hits >= target.hitsMax) {
        	    		creep.setTarget(null);
        	    		return;
        	    	}
        	        creep.repair(target);
        	    } else if(type === 'Structure' && (target.structureType === STRUCTURE_WALL || target.structureType === STRUCTURE_RAMPART)) {
        	    	if(target.hits > ROOM_WALLS_MAX_HITS || target.hits >= target.hitsMax || target.hitsMax <= 1) {
        	    		creep.setTarget(null);
        	    		return;
        	    	}
        	        creep.repair(target);
        	    } else if(type === 'ConstructionSite') { 
        	    	creep.build(target);	
        	    } else {
        	    	creep.say(type);
        	    }
                  
            } else {
                creep.moveTo(target);    
            }

		}
	}
};

creeps.filler = function(creep) {
	
	var source;
    var target = creep.getTarget();
    
    if(creep.room.storage) {
    	source = creep.room.storage;
    } else {
    	source = creep.getSource();
    }
     
    if(target === null) {
    	
    	if(target === null) {
			target = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter: function(object) {
				return object.structureType === STRUCTURE_EXTENSION && object.energy < object.energyCapacity;
			}});
    	}
    	
    	// If storage is available, check if there are any non full spawns
    	if(target === null) {
	    	if(creep.room.storage) {
	    		target = creep.pos.findClosestByRange(FIND_MY_SPAWNS, {filter: function(object) {
	                return object.energy < object.energyCapacity;
	            }});	
	    	}
    	}
        
        creep.setTarget(target);
    }
  
    if(!source && target) {
        source = target.pos.findClosestByRange(FIND_MY_SPAWNS);
        creep.setSource(source);
    }

    if(creep.carry.energy == 0) {
    	
    	if(creep.room.storage) {
    		creep.moveTo(creep.room.storage.pos);
    		creep.room.storage.transferEnergy(creep);
    		creep.resetTarget(target);
    		return;	
    	}
    	
        var source = creep.getSource();
        if(source) {
    		creep.moveTo(source);
    		if(source.mayDrainEnergy()) {
                source.transferEnergy(creep);
                creep.resetTarget(target);
    		}
        }
	} else {
		var target = creep.getTarget();
		if(target) {
            if(creep.pos.isNearTo(target)) {
            	
            	var type = target.constructor.name;
            	
            	if((type === 'Structure' && target.structureType === STRUCTURE_EXTENSION) || type === 'Spawn') {
            		console.log(target.energy);
        	        var res = creep.transferEnergy(target);
        	        console.log(target.energy);
        	        if(res == ERR_FULL) {
        	            creep.setTarget(null);
        	        }
        	    } else {
        	    	creep.say(type);
        	    }
                  
            } else {
                creep.moveTo(target);    
            }

		}
	}
};

creeps.mining = function(creep) {

	if(creep.memory.sleep && creep.memory.sleep > 0) {
		creep.memory.sleep--;
		return;
	}
	
	var task = creep.getTask();
	
	if(task === null) {
		task = creep.room.assignFreeTask('harvest', creep);
	}
	
	if(task === null) {
		if(creep.room.memory.parking) {
			if(!creep.pos.isNearTo(creep.room.memory.parking.x, creep.room.memory.parking.y)) {
				creep.moveTo(creep.room.memory.parking.x, creep.room.memory.parking.y);
			}
		}
		return;
	}
	
	
	// Move to position
	if(task.location && (task.location.x !== creep.pos.x || task.location.y !== creep.pos.y)) {
		creep.moveTo(task.location.x, task.location.y);
	} 
	
	// Harvest
	else {
		var source = Game.getObjectById(task.source);
		if(source) {
			if(source.energy === 0) {
				creep.memory.sleep = source.ticksToRegeneration;
				return;	
			}
			
			creep.harvest(source);
			return;
		}
	}

};

creeps.store = function(creep) {

	var task = creep.getTask();
	

	if(task === null) {
		task = creep.room.assignFreeTask('store', creep);
	}
	
	if(task) {
		
		if(task.creep !== creep.id) {
			creep.say('task fail');
			creep.memory.taskId = null;
			creep.memory.taskType = null;
			return;
		}
		
		// Move to position
		if(task.location && (task.location.x !== creep.pos.x || task.location.y !== creep.pos.y)) {
			creep.moveTo(task.location.x, task.location.y);
		} 
		
		// Grab from these sources (directions)
		else if(task.sources) {
			
			if(creep.isCarryFull()) {
				return;
			}
			
			_.forEach(task.sources, function(direction) {
				var x = creep.pos.x + directions[direction].dx;
				var y = creep.pos.y + directions[direction].dy;
				
				var energies = creep.room.lookForAt('energy', x, y);
				
				if(energies.length > 0) {
					if(energies[0].energy >= 50) {
						creep.pickup(energies[0]);
						return;
					}
				}
				
				var creeps = creep.room.lookForAt('creep', x, y);
				
				if(creeps.length > 0) {
					creeps[0].transferEnergy(creep);
				}
				
				
				
			});
			
			var energies = creep.room.lookForAt('energy', creep.pos);
			
			if(energies.length > 0) {
				if(energies[0].energy >= 50) {
					creep.pickup(energies[0]);
					return;
				}
			}
		}
		
	}
	
};

creeps.transferEnergyFromSource = function(sourceX, sourceY, creep, types) {
	
	if(types === undefined) {
		types = ['structure', 'creep', 'energy'];
	} else if(typeof types === 'string') {
		types = [types];
	}
	
	types.forEach(function(type) {
		var objects = creep.room.lookForAt(type, sourceX, sourceY);
		if(objects.length > 0) {
			objects.forEach(function(object) {
				if(type === 'energy') {
					creep.pickup(object);
				} else if (object.energy || (object.store && object.store.energy > 2000) || object.carry) {
					object.transferEnergy(creep);
				}
			});
		};
	});
	
};

creeps.transferEnergyToTarget = function(targetX, targetY, creep, types) {
	
	if(types === undefined) {
		types = ['creep', 'structure'];
	} else if(typeof types === 'string') {
		types = [types];
	}
	
	types.some(function(type) {
		var objects = creep.room.lookForAt(type, targetX, targetY);
		if(objects.length > 0) {
			var res = objects.some(function(object) {
				//console.log(object);
				if(object.energyCapacity || object.store || object.carry) {
					creep.transferEnergy(object);
					return true;
				}
			});
			
			return res;
		};
	});
	
};

creeps.truck = function(creep) {

	var task = creep.getTask();
	
	if(task === null) {
		task = creep.room.assignFreeTask('truck', creep);
	}
	
	if(task === null) {
		return;
	}
	
	if(task.creep !== creep.id) {
		creep.say('task fail');
		creep.memory.taskId = null;
		creep.memory.taskType = null;
		return;
	}
	
	if(task.locationSource && task.locationTarget) {
		
		var sourceX = task.locationSource.x;
		var sourceY = task.locationSource.y;
		var targetX = task.locationTarget.x;
		var targetY = task.locationTarget.y;
		
		var isNearSource = creep.pos.isNearTo(sourceX, sourceY);
	    var isNearTarget = creep.pos.isNearTo(targetX, targetY);
	    
	    var destination;
	    
	    if(isNearSource) {
	    	destination = creep.isCarryFull() ? 'target' : 'source';
	    } else {
	    	destination = creep.carry.energy === 0 ? 'source' : 'target';
	    }
	    
	    if(destination === 'source') {
	    	
	        if(isNearSource) {
	        	creeps.transferEnergyFromSource(sourceX, sourceY, creep, ['structure', 'creep' , 'energy']);
	        } else {
	            creep.moveTo(sourceX, sourceY);
	        }
	        
	        creeps.transferEnergyFromSource(creep.pos.x, creep.pos.y, creep, ['energy']);
	        
	    } else if (destination === 'target') {
	        if(isNearTarget) {
	        	creeps.transferEnergyToTarget(targetX, targetY, creep, ['creep', 'structure']);
	        } else {
	            creep.moveTo(targetX, targetY);
	        }
	    } else {
	    	creep.say('Where to?');
	    }
		
	}
	
	if(task.location) {
		
		if(creep.isCarryFull()) {
			var posStorage = creep.room.storage.pos;
			if(creep.pos.isNearTo(posStorage)) {
				creep.transferEnergy(creep.room.storage);
			} else {
				creep.moveTo(posStorage);
			}
			return;
		}
		
		var pos = creep.room.getPositionAt(task.location.x, task.location.y);
		
		// Move close to position
		if(!creep.pos.isNearTo(pos)) {
			creep.moveTo(pos);
			return;
		} 
		
		// Grab from these sources (directions)
		var stores = creep.room.lookForAt('creep', pos);
		
		if(stores.length > 0) {
			stores[0].transferEnergy(creep);
		}
	
	}
		

};


creeps.cable = function(creep) {

	var task = creep.getTask();
	
	if(task === null) {
		task = creep.room.assignFreeTask('cable', creep);
	}
	
	if(task === null) {
		return;
	}
	
	if(task.creep !== creep.id) {
		creep.say('task fail');
		creep.memory.taskId = null;
		creep.memory.taskType = null;
		return;
	}

	//Move to position
	if(task.location && (task.location.x !== creep.pos.x || task.location.y !== creep.pos.y)) {
		creep.moveTo(task.location.x, task.location.y);
		return;
	} 
	
	if(!creep.isCarryFull()) {
		if(task.source) {
			var x = creep.pos.x + directions[task.source].dx;
			var y = creep.pos.y + directions[task.source].dy;
			
			var creeps = creep.room.lookForAt('creep', x, y);
			if(creeps.length > 0) {
				creeps[0].transferEnergy(creep);
				return;
			}
			
			var storages = creep.room.lookForAt('structure', x, y);
			if(storages.length > 0) {
				if(storages[0].structureType === STRUCTURE_STORAGE) {
					storages[0].transferEnergy(creep);
					return;
				}
				
			}
		}
	}
	
};

//creep.cableTransfer  ();

creeps.plug = function(creep) {

	var task = creep.getTask();
	
	if(task === null) {
		task = creep.room.assignFreeTask('plug', creep);
	}
	
	if(task === null) {
		return;
	}
	
	if(task.creep !== creep.id) {
		creep.say('task fail');
		creep.memory.taskId = null;
		creep.memory.taskType = null;
		return;
	}

	//Move to position
	if(task.location && (task.location.x !== creep.pos.x || task.location.y !== creep.pos.y)) {
		creep.moveTo(task.location.x, task.location.y);
		return;
	} 
	
	if(task.source && creep.carry.energy <= 25) {
		
		var x = creep.pos.x + directions[task.source].dx;
		var y = creep.pos.y + directions[task.source].dy;
		
		creeps.transferEnergyFromSource(x, y, creep);
	}
	
	if(task.target) {
		var x = creep.pos.x + directions[task.target].dx;
		var y = creep.pos.y + directions[task.target].dy;
		
		var structures = creep.room.lookForAt('structure', x, y);
		
		if(structures.length > 0) {
			if(structures[0].structureType === STRUCTURE_CONTROLLER) {
				creep.upgradeController(structures[0]);	
			}
			
		}
	}
	
	//creep.say('boring');
	
};

creeps.defender = function(creep) {
	
	var target = creep.getTarget();
	var source = creep.getSource();
	//var command = creep.getCommand();
	
	if(!target) {
		target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {filter: function(enemy) {
			return enemy.body.length < 30;
		}});
		creep.setTarget(target);
	}
	
	if(!target && !source) {
		source = creep.pos.findClosest(FIND_MY_SPAWNS);
		creep.setSource(source);
	}
	
	if(target) {
		creep.moveTo(target);
		creep.attack(target);
	} else if(source) {
		var range = creep.pos.getRangeTo(source);
		if(range > 3) {
			creep.moveTo(source);	
		}
	} 
};


// Helper

creeps.setTaskSource = function(room, task, source) {
	_.forOwn(room.find(FIND_MY_CREEPS), function(creep) {
		if(creep.memory.task === task) {
			creep.setSource(source);
		}
	});
};

creeps.isValidUnit = function(unit) {
    return _.has(creeps.units, unit);
};

creeps.isValidTask = function(task) {
    return _.has(creeps.tasks, task);
};