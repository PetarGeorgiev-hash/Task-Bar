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

        columns,

        columnField: `status`,

        project,

        listeners: {
            taskDrop(e) {
                snippet.fireEvent("onTaskDrop", e);
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

                obj.description = record.fields[snippet.Note];

                idCount++;
                console.log(obj);
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
