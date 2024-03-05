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
export class UBWebLoader {
    constructor(s) {
        this.scene = s;
        this.propertyStrings = [];
        this.entityTypes = [];
        this.levelWrappers = [];
        this.entities = [];
        this.ubweb_version = "1.1";
    }

    //public:
    loadFromFileData(filename, filedata) {
        this.dataViewReader = new DataViewReader(filedata)

        let signature = this.dataViewReader.readString(4)
        if (signature !== "UB01")
            return false

        let file_version = this.loadString();
        if (file_version != this.ubweb_version) {
            console.error("UBWebLoader.js: Wrong ubweb file version (" + file_version + ") " + ", actual version: " + this.ubweb_version);
            return false;
        }

        this.tableOfContents = new Map();
        this.loadScene()

        this.initLevelsMapForRevit(filename);

        this.scene.properties = [
            ...this.scene.properties,
            ...this.entities
        ]

        for (let entity of this.entities) {
            entity.id = entity.Id;
            entity.fileId = filename;
            entity.object = entity.Category;
        }

        console.log("Loaded from ubweb " + this.entities.length + " entities!");

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

        this.loadSection("Metadata", () => this.loadMetadata());
        this.loadSection("PropertiesStrings", () => this.loadPropertyStrings());
        this.loadSection("ElementTypes", () => this.loadElementTypes());
        this.loadSection("Levels", () => this.loadLevels());
        this.loadSection("MeshEntities", () => this.loadMeshEntities());
        this.loadSection("CompoundEntities", () => this.loadCompoundEntities());
        this.loadSection("ReferenceEntities", () => this.loadReferenceEntities());
        this.loadSection("SpatialEntities", () => this.loadSpatialEntities());
        this.loadSection("Filters", () => this.loadFilters());
    }

    loadMetadata() {
        this.scene.source = this.loadString();
        this.loadString();
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
        level.Elevation = this.dataViewReader.readFloat32();
        level.Parameters = this.loadProperties();

        let levelWrapper = {};
        levelWrapper.Level = level;
        this.levelWrappers.push(levelWrapper);
    }

    loadEdges() {
        let hasEdges = this.dataViewReader.readUint8();
        if (hasEdges == 0) {
            return;
        }

        let nb_points = this.dataViewReader.readUint32();
        let nb_edges = this.dataViewReader.readUint32();

        for (let i = 0; i < nb_points; ++i) {
            let v_index = this.dataViewReader.readUint32();
            if (v_index == 0) {
                let point = this.loadXYZ();
            }
        }
        for (let e = 0; e < nb_edges; e++) {
            let edge = this.dataViewReader.readUint32();
        }
    }

    loadMeshEntities() {
        this.loadArray(() => {
            let entity = this.loadMeshEntity(new Entity());
            this.entities.push(entity);
            this.scene.objectsMap[entity.Id] = entity;
            this.loadEdges();
        });
    }

    loadCompoundEntities() {
        this.loadArray(() => {
            let entity = this.loadCompoundEntity();
            this.entities.push(entity);
            this.scene.objectsMap[entity.Id] = entity;
            this.loadEdges();
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
            entity.SubElements.push(subEntity);
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
        return meshEntity;
    }


    loadEntity(entity) {

        entity.Id = this.loadString();
        entity.Name = this.loadString();
        entity.Category = this.loadString();
        let componentName = this.loadString();
        entity.Level = this.loadString();
        let position = this.loadAx3();

        let entityTypeIdx = this.dataViewReader.readUint32();

        if (entityTypeIdx !== -1) {
            entity.EntityType = this.entityTypes[entityTypeIdx];
            entity.Parameters = [...entity.Parameters, ...entity.EntityType.Properties];
        }

        let instanceProperties = this.loadProperties();
        entity.Parameters = this.groupByTitle([...entity.Parameters, ...instanceProperties]);
        entity.hidden = false;
    }

    loadSpatialEntities() {
        this.loadArray(() => {
            let entity = this.loadMeshEntity(new Entity());
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

        let GrouppedByCategories = null;

        if (jRoot !== null)
        {
            if (Object.hasOwn(jRoot, 'GrouppedByCategories'))
            {
                GrouppedByCategories = jRoot.GrouppedByCategories;
            }
        }

        let filters = GrouppedByCategories || []
        this.initFilters(filters)
    }


    loadPropertyStrings() {
        this.loadArray((idx) => {
            this.propertyStrings.push(this.loadString());
        })
    }

    loadElementTypes() {
        this.loadArray(() => {
            this.loadElementType();
        })
    }

    loadElementType() {
        let result = new EntityType();
        result.Name = this.loadString();
        result.Properties = this.loadProperties();
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

        result.theN = this.loadXYZ();
        result.theX = this.loadXYZ();
        result.theP = this.loadXYZ();

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


    initLevelsMapForRevit(filename) {
        this.scene.levelsMap[filename] = {}
        this.levelWrappers.map(l => {
            this.scene.levelsMap[filename][l.Level.Id] = {
                ...l,
                items: this.entities.filter(f => f.Level == l.Level.Id).map(m => m.Id)
            }
        })
        let stack = {}
        this.entities.map(o => {
            if (!this.scene.levelsMap[filename][o.Level]) {
                stack[o.Level] = stack[o.Level] || {
                    Level: {
                        Id: o.Level,
                        Name: 'Уровень ' + o.Level
                    },
                    items: []
                }
                stack[o.Level].items.push(o.Id)
            }
        })
        this.scene.levelsMap[filename] = {
            ...this.scene.levelsMap[filename],
            ...stack
        }
    }

    initFilters(filters) {
        let list = filters.map(f => {
            return {
                title: f.title,
                name: f.title,
                items: f.items.map(i => {
                    return {
                        name: i.title,
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
            if (this.scene.filters.some(ai => ai.title == bi.title)) {
                let e1 = []
                this.scene.filters = this.scene.filters.map(ai => {
                    if (ai.title != bi.title) {
                        return ai
                    }
                    else {
                        bi.items.map(bi1 => {
                            if (ai.items.some(ai1 => ai1.name == bi1.name)) {
                                let e2 = []
                                ai.items = ai.items.map(ai1 => {
                                    if (ai1.name != bi1.name) {
                                        return ai1
                                    }
                                    else {
                                        bi1.items.map(bi2 => {
                                            if (!ai1.items.some(ai2 => ai2.name == bi2.name)) {
                                                e2 = [...e2, bi2]
                                            }
                                        })
                                        ai1.items = [...ai1.items, ...e2]
                                        return ai1
                                    }
                                })
                            }
                            else {
                                e1 = [...e1, bi1]
                            }
                        })
                        ai.items = [...ai.items, ...e1]
                        return ai
                    }
                })
            }
            else {
                e = [...e, bi]
            }
        })
        this.scene.filters = [...this.scene.filters, ...e]

        return list
    }
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
