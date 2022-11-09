var snippet = this;
debugger;
let snippetProjectionRecordUuid = "";
let snippetColumnProjectionUuid = "";

if (typeof snippet.ColumnProjection !== "undefined") {
    snippetColumnProjectionUuid = snippet.ColumnProjection[0].recordUuid;
}

if (typeof snippet.Proj !== "undefined") {
    snippetProjectionRecordUuid = snippet.Proj[0].recordUuid;
}

// get projection snippet reference by id
let projectionSnippet = snippet.velocity.getSnippet(
    snippetProjectionRecordUuid
);

let ColumnProjectionSnippet = snippet.velocity.getSnippet(
    snippetColumnProjectionUuid
);

const globalColumns = new Promise((resolve) => {
    ColumnProjectionSnippet.addEventListener("onReady", function (event) {
        debugger;
        let source = event.sourceElement;
        let projection = source.projection;
        let entityObjName = projection.manifest.projectionObjectName;
        //let projectionData = projection.data[entityObjName];
        resolve(taskBoardPG.columns(projection));
    });
});

const globalTasks = new Promise((resolve) => {
    projectionSnippet.addEventListener("onReady", function (event) {
        let source = event.sourceElement;
        let projection = source.projection;
        let entityObjName = projection.manifest.projectionObjectName;
        let projectionData = projection.data[entityObjName];

        resolve(taskBoardPG.project(projection));
    });
});

Promise.all([globalColumns, globalTasks]).then((values) => {
    const columns = values[0];
    const project = values[1];
    new bryntum.taskboard.TaskBoard({
        appendTo: snippet.domRef,

        useDomTransition: true,
        stickyHeaders: true,

        footerItems: {
            id: { type: "text", editor: null },
        },

        columns,

        columnField: `status`,

        project,

        listeners: {
            async beforeTaskDrop(e) {
                snippet.addEventListener("onTaskDrop", function (e) {
                    debugger;

                    let recordsWithAllRequest = [];
                    const newStage = e.miscProperties.targetColumn.data.id;
                    const recordsArr = e.miscProperties.taskRecords;
                    function newRecordFunc(record, oldStage, newStage) {
                        const stringObj = JSON.stringify(record);
                        const replacedString = stringObj.replaceAll(
                            oldStage,
                            newStage
                        );
                        return JSON.parse(replacedString);
                    }
                    recordsArr.forEach((record) => {
                        const stagePath =
                            record.data.record.fields[snippet.Stage];
                        const oldStage = stagePath[0].name;
                        const baseObjectName = record.data.baseObjectName;
                        const newRecord = newRecordFunc(
                            record.record,
                            oldStage,
                            newStage
                        );

                        const recordUuid = record.data.record.uuid;

                        let requestObj = {};
                        for (key in newRecord.fields) {
                            const indexOfDot = key.indexOf(".");
                            const newKey = key.slice(indexOfDot + 1);
                            requestObj.Stage = [
                                newRecord.fields[`${baseObjectName}.Stage`][0]
                                    .id,
                            ];
                        }
                        networkManager
                            .patch(
                                `/api/v2/command/${baseObjectName}/${recordUuid}`,
                                requestObj
                            )
                            .then((res) => {
                                snippet.fireEvent("onError", res);
                            })
                            .catch((error) => {
                                snippet.fireEvent("onError", error);
                            });
                    });
                });

                snippet.fireEvent("onTaskDrop", e);

                const promise = new Promise((resolve) => {
                    snippet.addEventListener("onError", function (e) {
                        debugger;
                        if (e.miscProperties.statusCode == 400) {
                            resolve(false);
                        } else {
                            resolve(true);
                        }
                    });
                });
                let final;
                await promise.then((nz) => (final = nz));
                if (final === false) {
                }
                return final;
            },
            taskClick(e) {
                const domEl = e.event.target;
                //e.taskRecord.data.record.uuid
                if (domEl.dataset.field == "name") {
                    snippet.fireEvent(
                        "onTextClick",
                        e.taskRecord.data.record.fields["WorkOrders.ID"]
                    );
                }
            },
        },
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
                obj.record = record;

                obj.baseObjectName = response.manifest.baseEntity;

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
