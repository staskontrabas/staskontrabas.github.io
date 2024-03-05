//public:

class Property {
    Name = "";
    Value = "";
    Units = "";
};

class PropertiesGroup {
    Title = "";
    Properties = [];//list of Property
};

class EntityType {
    Name = ""
    Properties = null
}

class Entity {
    Id = "";
    Name = "";
    Category = "";
    Level = "";
    EntityType = null;
    Parameters = [];//list of PropertiesGroup
    SubElements = [];
}

export const loadUBViewSceneFromBinData = (id, filedata, store) => {
    let binLoader = new BinLoader(store);
    if (!binLoader.loadFromFileData(filedata))
        return false;

    store.source = 'Revit';

    initLevelsMapForRevit({
        file: id,
        storeData: store
    }, binLoader.entities, binLoader.levelWrappers);

    store.properties = [
        ...store.properties,
        ...binLoader.entities
    ]

    for (let entity of binLoader.entities) {
        entity.id = entity.Id;
        entity.object = entity.Category;
    }

    return true
}

const initLevelsMapForRevit = (r, objects, levels) => {
    r.storeData.levelsMap[r.file] = {}
    levels.map(l => {
        r.storeData.levelsMap[r.file][l.Level.Id] = {
            ...l,
            items: objects.filter(f => f.Level == l.Level.Id).map(m => m.id)
        }
    })
    let stack = {}
    objects.map(o => {
        if (!r.storeData.levelsMap[r.file][o.Level]) {
            stack[o.Level] = stack[o.Level] || {
                Level: {
                    Id: o.Level,
                    Name: 'Уровень ' + o.Level
                },
                items: []
            }
            stack[o.Level].items.push(o.id)
        }
    })
    r.storeData.levelsMap[r.file] = {
        ...r.storeData.levelsMap[r.file],
        ...stack
    }
}

const initFilters = (filters, store) => {
    let list = filters.map(f => {
        return {
            title: f.title,
            name: f.title,
            items: f.items.map(i => {
                return {
                    name:  i.title,
                    title: i.title,
                    active: false,
                    filter: 'category',
                    items: i.grouppedByElementTypes.map(t => {
                        return {
                            active: false,
                            filter: 'type',
                            category: i.title,
                            name: t.title,
                            title: t.title,
                            items: []
                        }
                    })
                }
            })
        }
    })
    let e = []
    list.map(bi => {
        if(store.filters.some(ai => ai.title == bi.title)){
            let e1 = []
            store.filters = store.filters.map(ai => {
                if(ai.title != bi.title){
                    return ai
                }
                else{
                    bi.items.map(bi1 => {
                        if(ai.items.some(ai1 => ai1.name == bi1.name)){
                            let e2 = []
                            ai.items = ai.items.map(ai1 => {
                                if(ai1.name != bi1.name){
                                    return ai1
                                }
                                else{
                                    bi1.items.map(bi2 => {
                                        if(!ai1.items.some(ai2 => ai2.name == bi2.name)){
                                            e2 = [...e2, bi2]
                                        }
                                    })
                                    ai1.items = [...ai1.items, ...e2]
                                    return ai1
                                }
                            })
                        }
                        else{
                            e1 = [...e1, bi1]
                        }
                    })
                    ai.items = [...ai.items, ...e1]
                    return ai
                }
            })
        }
        else{
            e = [...e, bi]
        }
    })
    store.filters = [...store.filters, ...e]

    return list
}

//private:
class BinLoader {
    constructor(s) {
        this.scene = s;
        this.propertyStrings = [];
        this.entityTypes = [];
        this.levelWrappers = [];
        this.entities = [];
    }

    //public:
    loadFromFileData(filedata) {
        this.dataViewReader = new DataViewReader(filedata)

        let signature = this.dataViewReader.readString(4)
        if (signature !== "UB01")
            return false

        this.tableOfContents = new Map();
        this.loadScene()

        console.log("Loaded from bin format " + this.entities.length + " entities!");

        return true
    }

    //private:

    loadTableOfContents() {
        let tableOfContentsOffset = this.dataViewReader.readUint32();

        let prevPos = this.dataViewReader.position;
        this.dataViewReader.position = tableOfContentsOffset;

        this.loadArray(() => {
            let sectionName = this.loadString();
            let offset = this.dataViewReader.readUint32();
            this.tableOfContents.set(sectionName.toLowerCase(), offset);
        });

        this.dataViewReader.position = prevPos;
    }

    loadScene() {
        this.loadTableOfContents();

        this.loadSection("PropertiesStrings", () => this.loadPropertyStrings());
        this.loadSection("ElementTypes", () => this.loadElementTypes());
        this.loadSection("Levels", () => this.loadLevels());
        this.loadSection("CompoundEntities", () => {
            this.loadCompoundEntities(); // Тут специально сделано два раза! Это временный костыль из-за особенностей Ревита @Kononov.
            this.loadCompoundEntities();
        });

        this.loadSection("ReferenceEntities", () => this.loadReferenceEntities());
        this.loadSection("SpatialEntities", () => this.loadSpatialEntities());
        this.loadSection("Filters", () => this.loadFilters());
    }

    loadLevels() {
        this.loadArray(() => {
            this.loadLevel();
        });
    }

    loadLevel() {
        let level = {}
        level.Id = this.loadString();
        level.Name = this.loadString();
        level.Parameters = this.loadProperties();

        let levelWrapper = {};
        levelWrapper.Level = level;
        this.levelWrappers.push(levelWrapper);
    }

    loadCompoundEntities() {
        this.loadArray(() => {
            let entity = this.loadCompoundEntity();
            this.entities.push(entity);
            this.scene.objectsMap[entity.Id] = entity;
        });
    }

    loadReferenceEntities() {
        this.loadArray(() => {
            let entity = this.loadReferenceEntity();
            this.entities.push(entity);
            this.scene.objectsMap[entity.Id] = entity;
        })
    }

    loadCompoundEntity() {
        let entity = new Entity();
        this.loadMeshEntity(entity)

        this.loadArray(() => {
            let subEntity = new Entity();
            this.loadMeshEntity(subEntity);
        });

        return entity;
    }

    loadReferenceEntity() {
        let entity = new Entity();
        let originalEntityId = this.loadString();
        this.loadEntity(entity);
        return entity;
    }

    loadMeshEntity(meshEntity) {
        this.loadEntity(meshEntity);

        this.loadArray(() => {
            let meshIdx = this.dataViewReader.readUint32();
        });
    }


    loadEntity(entity) {

        entity.Id = this.loadString();
        entity.Name = this.loadString();
        entity.Category = this.loadString();
        let componentName = this.loadString();
        entity.Level = this.loadString();
        let position = this.loadAx3();

        let entityTypeIdx = this.dataViewReader.readUint32();
console.log('loadEntity entityTypeIdx', entityTypeIdx)
console.log('loadEntity this.entityTypes', this.entityTypes)
        if (entityTypeIdx !== -1) {
            entity.EntityType = this.entityTypes[entityTypeIdx];
console.log('----- -1 loadEntity entityTypeIdx, entity.EntityType', entityTypeIdx, entity.EntityType)
            entity.Parameters = [...entity.Parameters, ...entity.EntityType.Properties];
        }

        let instanceProperties = this.loadProperties();
        entity.Parameters = this.groupByTitle([...entity.Parameters, ...instanceProperties]);
        entity.hidden = false;
    }

    loadSpatialEntities() {
        this.loadArray(() => {
            let entity = this.loadCompoundEntity();
            entity.active = true;
            this.entities.push(entity);
            this.scene.rooms.list.push(entity);
            this.scene.objectsMap[entity.Id] = entity;
            //this.scene.rooms.load = true;
        });


    }

    loadFilters() {
        let filtersJsonString = this.loadString();
        let jRoot = JSON.parse(filtersJsonString);

        let filters = jRoot.GrouppedByCategories || []
        initFilters(filters, this.scene)
    }


    loadPropertyStrings() {
        this.loadArray((idx) => {
            this.propertyStrings.push(this.loadString());
        })
    }

    loadElementTypes() {
console.log('---loadElementTypes')
        this.loadArray(() => {
            this.loadElementType();
        })
    }

    loadElementType() {
        let result = new EntityType();
        result.Name = this.loadString();
        result.Properties = this.loadProperties();
console.log('-loadElementType result.Properties', result.Properties)
        this.entityTypes.push(result);
    }

    loadProperties() {
        let propertiesGroupDescs = [];

        this.loadArray(() => {
            let propertiesGroup = new PropertiesGroup();

            let titleIdx = this.dataViewReader.readUint32();
            if (titleIdx === -1)
                throw new Error("titleIdx === -1");

            propertiesGroup.Title = this.propertyStrings[titleIdx];

            this.loadArray(() => {
                let property = new Property();

                let nameIdx = this.dataViewReader.readUint32();
                let valueIdx = this.dataViewReader.readUint32();
                let unitsIdx = this.dataViewReader.readUint32();

                if (nameIdx === -1)
                    throw new Error("nameIdx === -1");

                property.Name = this.propertyStrings[nameIdx];

                if (valueIdx !== -1)
                    property.Value = this.propertyStrings[valueIdx];

                if (unitsIdx !== -1)
                    property.Units = this.propertyStrings[unitsIdx];

                propertiesGroup.Properties.push(property);
            });

            propertiesGroupDescs.push(propertiesGroup);
        });

        return propertiesGroupDescs;
    }

    //private:

    loadSection(sectionName, loadFunc) {
        let sectionNameLowerred = sectionName.toLowerCase();

        let offset = this.tableOfContents.get(sectionNameLowerred);

        if (offset === undefined) {
            throw new Error("Can't find section " + sectionName);
        }


        let prevPos = this.dataViewReader.position;
        this.dataViewReader.position = offset;
        loadFunc();

        this.dataViewReader.position = prevPos;
    }

    loadArray(loadFunc) {
        let size = this.dataViewReader.readUint32()
    console.log('+++loadArray this.dataViewReader, size', this.dataViewReader, size)
        for (let idx = 0; idx < size; ++idx) {
            loadFunc(idx);
        }
        return size;
    }

    loadString() {
        let size = 0;
        let shift = 0;
        while (true) {
            const byte = this.dataViewReader.readUint8();
            size |= ((byte & 0x7F) << shift);
            if ((byte & 0x80) === 0)
                break;
            shift += 7;
        }


        if (size === 0)
            return "";

        return this.dataViewReader.readString(size);
    }


    loadAx3() {
        let result = {}

        result.theP = this.loadXYZ();
        result.theN = this.loadXYZ();
        result.theX = this.loadXYZ();

        return result;
    }

    loadXYZ() {
        let xyz = {};

        xyz.X = this.dataViewReader.readFloat32();
        xyz.Y = this.dataViewReader.readFloat32();
        xyz.Z = this.dataViewReader.readFloat32();
        return xyz;
    }

    groupByTitle(list) {
        list = list.reduce(function (accumulator, currentValue) {
            accumulator[currentValue.Title] = accumulator[currentValue.Title] || {
                Title: currentValue.Title,
                Properties: []
            }
            accumulator[currentValue.Title].Properties = [...accumulator[currentValue.Title].Properties, ...currentValue.Properties]
            return accumulator;
        }, {});
        return Object.values(list)
    };
}


class DataViewReader {
    constructor(filedata) {
        this._dataview = new DataView(filedata)
        this._pos = 0
        this._textDecoder = new TextDecoder()
    }

    readString(size) {
        let rawText = this._dataview.buffer.slice(this._pos, this._pos + size)
        this._pos += size
        return this._textDecoder.decode(rawText)
    }

    readUint8() {
        let result = this._dataview.getUint8(this._pos, true)
        this._pos += 1
        return result
    }

    readUint32() {
        let result = this._dataview.getUint32(this._pos, true)
        this._pos += 4
        if (result !== 0xffffffff)
            return result
        else
            return -1
    }

    readFloat32() {
        let result = this._dataview.getFloat32(this._pos, true)
        this._pos += 4
        return result

    }

    buffer() {
        return this._dataview.buffer
    }

    set position(v) {
        this._pos = v
    }
    get position() {
        return this._pos
    }
}
