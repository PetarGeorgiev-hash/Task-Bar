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

// waiting for projection to be done shaping data from query

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
