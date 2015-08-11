var _ = require('lodash');
var creeps = require('creeps');
var ai = function() {};
module.exports = ai;

ai.getSpawn = function(room) {
	var spawns = room.find(FIND_MY_SPAWNS);
	if(spawns.length > 0) {
		return spawns[0];
	}
    return null;
};

ai.createHarvester = function(room) {
    var spawn = ai.getSpawn(room);
    var creepName = creeps.create(spawn, 'small_worker', 'harvester');
    return creepName;
};

ai.createFiller = function(room) {
    var spawn = ai.getSpawn(room);
    var creepName = creeps.create(spawn, 'small_worker', 'filler');
    return creepName;
};

ai.createBuilder = function(room) {
    var spawn = ai.getSpawn(room);
    var creepName = creeps.create(spawn, 'small_worker', 'builder');
    return creepName;
};

ai.tick = function() {

    _.forOwn(Game.rooms, function(room) {
        if(room.memory.mode === 'build') {
            ai.doModeBuild(room);
        }
    });

};

ai.doModeBuild = function(room) {

	var count = {};

    _.forOwn(room.find(FIND_MY_CREEPS), function(creep) {
        var task = creep.memory.taskDefault;
        if(count[task] === undefined) {
            count[task] = 0;
        }

        count[task]++;
    });

    if(count['harvester'] === undefined || count['harvester'] < 3) {
        ai.createHarvester(room);
    } else if(count['filler'] === undefined || count['filler'] < 2) {
        ai.createFiller(room);
    } else if(count['builder'] === undefined || count['builder'] < 1) {
        ai.createBuilder(room);
    }

};
