Spawn.prototype.mayDrainEnergy = function() {
    return (this.memory.energyAllowDrain === undefined || this.memory.energyAllowDrain) && this.energy >= this.energyCapacity;
};