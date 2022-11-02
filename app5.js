const obj = {
    manifest: {
        projectionObjectName: "Stages",
        SQLQuery: "",
        selectOptions: {
            distinct: false,
        },
        data: true,
        schema: true,
        baseEntity: "BuilderComponents",
        baseEntityUUID: "0bf7a0b1-d6f9-4b17-8574-3259bd68a833",
        baseEntityObjectName: "BuilderComponents",
        isContextSet: false,
        isSelectedRecordsSet: false,
        contextFilter: [],
        haveVirtualField: true,
        virtualFieldObjectName: "BuilderComponents.Name",
    },
    schema: {
        Stages: {
            interfaces: {
                RecordEssentials: [
                    {
                        field: "Name",
                        dataType: "Text",
                    },
                    {
                        field: "ID",
                        dataType: "Text",
                    },
                ],
                InterfaceCDNConformingRecords: [
                    {
                        field: "Name",
                        dataType: "Text",
                    },
                ],
            },
            type: "Entity",
            fields: [
                {
                    objectName: "Stages.Name",
                    dataType: "Text",
                    heading: "Name",
                    headingTranslated: "Name",
                    required: true,
                    properties: {
                        length: 200,
                        InterfaceMap: {
                            RecordEssentials: [
                                {
                                    field: "Name",
                                },
                            ],
                            InterfaceCDNConformingRecords: [
                                {
                                    field: "Name",
                                },
                            ],
                        },
                        entity: {
                            objectName: "BuilderComponents",
                        },
                        originalObjectName: "Name",
                    },
                },
            ],
        },
    },
    data: {
        Stages: [
            {
                isSelected: false,
                isFiltered: false,
                uuid: "a0b97535-5134-459b-94e0-11dc8683c3e1",
                uniqueRowUUID: "a0b97535-5134-459b-94e0-11dc8683c3e1",
                versionUuid: "aae509bc-8bd1-4c2e-885a-5065bb0a33d1",
                fields: {
                    "Stages.Name": "Planning",
                },
                rowIndex: 1,
            },
            {
                isSelected: false,
                isFiltered: false,
                uuid: "a0b97535-5134-459b-94e0-11dc8683c3e2",
                uniqueRowUUID: "a0b97535-5134-459b-94e0-11dc8683c3e2",
                versionUuid: "aae509bc-8bd1-4c2e-885a-5065bb0a33d2",
                fields: {
                    "Stages.Name": "Draft",
                },
                rowIndex: 2,
            },
            {
                isSelected: false,
                isFiltered: false,
                uuid: "a0b97535-5134-459b-94e0-11dc8683c3e3",
                uniqueRowUUID: "a0b97535-5134-459b-94e0-11dc8683c3e3",
                versionUuid: "aae509bc-8bd1-4c2e-885a-5065bb0a33d3",
                fields: {
                    "Stages.Name": "Open",
                },
                rowIndex: 3,
            },
            {
                isSelected: false,
                isFiltered: false,
                uuid: "a0b97535-5134-459b-94e0-11dc8683c3e4",
                uniqueRowUUID: "a0b97535-5134-459b-94e0-11dc8683c3e4",
                versionUuid: "aae509bc-8bd1-4c2e-885a-5065bb0a33d4",
                fields: {
                    "Stages.Name": "Closed",
                },
                rowIndex: 4,
            },
        ],
    },
};

var snippet = this;
debugger;
let snippetProjectionRecordUuid = "";
let snippetColumnProjectionUuid = "";

if (typeof snippet.ColumnProjection !== "undefined") {
    snippetColumnProjectionUuid = snippet.ColumnProjection[0].recordUuid;
}

if (typeof snippet.Proj !== "undefined") {
    // snippet.Projection is the added field in the snippet form from d)
    snippetProjectionRecordUuid = snippet.Proj[0].recordUuid;
}

// get projection snippet reference by id
let projectionSnippet = snippet.velocity.getSnippet(
    snippetProjectionRecordUuid
);

let ColumnProjectionSnippet = snippet.velocity.getSnippet(
    snippetColumnProjectionUuid
);

ColumnProjectionSnippet.addEventListener("onReady", function (event) {
    debugger;
    let source = event.sourceElement;
    let projection = source.projection;
    let entityObjName = projection.manifest.projectionObjectName;
    //let projectionData = projection.data[entityObjName];
    const columns = taskBoardPG.columns(obj);
});
// waiting for projection to be done shaping data from query
projectionSnippet.addEventListener("onReady", function (event) {
    let source = event.sourceElement;
    let projection = source.projection;
    let entityObjName = projection.manifest.projectionObjectName;
    let projectionData = projection.data[entityObjName];

    const project = taskBoardPG.project(projection);
    const columns = taskBoardPG.columns(obj);
    console.log(snippet.domRef);

    const taskBoard = new bryntum.taskboard.TaskBoard({
        appendTo: snippet.domRef,

        columns,

        columnField: `status`,

        project,
    });
});

if (typeof window.taskBoardPG == "undefined") {
    window.taskBoardPG = {
        project: function (response) {
            let project = {};
            debugger;
            const tasks = [];
            const responseObj = response.manifest.projectionObjectName;
            let idCount = 1;
            response.data[responseObj].forEach((record) => {
                let obj = { id: idCount };

                obj.name = record.fields[snippet.Title];
                record.fields[snippet.Stage].forEach((el) => {
                    obj.status = el.name;
                });

                obj.description = record.fields[snippet.Note];

                idCount++;

                tasks.push(obj);
            });

            project.tasks = tasks;
            return project;
        },

        columns: function (response) {
            const columns = [];
            let columnsObj = {};
            const responseObj = response.manifest.projectionObjectName;
            let objectName;
            response.schema[responseObj].fields.forEach((el) => {
                objectName = el.objectName;
            });
            debugger;
            response.data[responseObj].forEach((record) => {
                if (record.fields[objectName] in columnsObj) {
                } else {
                    columnsObj[record.fields[objectName]] = {
                        id: record.fields[objectName],
                        text: record.fields[objectName].toUpperCase(),
                    };
                }
            });

            for (const key in columnsObj) {
                columns.push(columnsObj[key]);
            }

            return columns;
        },
    };
}
