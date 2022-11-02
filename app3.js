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
    let projectionData = projection.data[entityObjName];
    const columns = taskBoardPG.columns(projection);
});
// waiting for projection to be done shaping data from query
projectionSnippet.addEventListener("onReady", function (event) {
    let source = event.sourceElement;
    let projection = source.projection;
    let entityObjName = projection.manifest.projectionObjectName;
    let projectionData = projection.data[entityObjName];

    const project = taskBoardPG.project(projection);
    console.log(columns, project);
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
            response.data[responseObj].forEach((record) => {
                record.fields[responseObj].forEach((el) => {
                    if (el.name in columnsObj) {
                    } else {
                        columnsObj[el.name] = {
                            id: el.name,
                            text: el.name.toUpperCase(),
                        };
                    }
                });
            });

            for (const key in columnsObj) {
                columns.push(columnsObj[key]);
            }

            return columns;
        },
    };
}
