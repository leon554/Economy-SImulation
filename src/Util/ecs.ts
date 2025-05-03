export type Entity = number

export class ECS{
    private nextEntityID: number = 0
    private components = new Map<Function, Map<Entity, any>>()

    public createEntity(): Entity{
        return this.nextEntityID++
    }
    public getEntityCount(){
        return this.nextEntityID - 1
    }

    addComponent<T>(entity: Entity, componentClassName: new (...args: any[]) => T, componentInstance: T){
        if(!this.components.has(componentClassName)){
            this.components.set(componentClassName, new Map())
        }

        this.components.get(componentClassName)!.set(entity, componentInstance)
    }  

    getComponent<T>(entity: Entity, componentClassName: new (...args: any[]) => T): T | undefined{
        return this.components.get(componentClassName)?.get(entity) as T | undefined
    }
    getComponents<T>(componentClassName: new (...args: any[]) => T): T[]{
        if(!this.components.has(componentClassName)) return []

        return Array.from(this.components.get(componentClassName)!.values())
    }

    hasComponent<T>(entity: Entity, componentClassName: new (...args: any[]) => T){
        if(!this.components.has(componentClassName)) return false
        if(!this.components.get(componentClassName)!.has(entity)) return false
        return true
    }

    getEntitiesWithComponents(...componentClasses: (new (...args: any[]) => any)[]): Entity[]{
        if(componentClasses.length == 0) return []

        const componentMaps = componentClasses.map(ccn => this.components.get(ccn))

        if(componentMaps.some(componentMap => !componentMap)) return []

        const entityIds = Array.from(componentMaps[0]!.keys())

        return entityIds.filter(id => componentMaps.every(componentMap => componentMap?.has(id)))
    }

    deleteEntity(entity: Entity){
        for (const [_, componentMap] of this.components) {
            componentMap.delete(entity);
        }  
    }
}