requestObj.Name = newRecord.fields[WorkOrder.Name];
requestObj.ID = newRecord.fields[WorkOrder.ID];
let SalesOrderLinesArr = [];
let SalesOrderLinesObj = {};
//  SalesOrderLinesObj.entityUuid = PGDE9
SalesOrderLinesObj.recordUuid =
    newRecord.fields[WorkOrder.SalesOrderLines][0].uuid;

PGDE9.addEventListener("onTaskDrop", function (e) {
    console.log("taskDropEvent", e);
    debugger;
    const newStage = e.miscProperties.targetColumn.data.id;
    const recordsArr = e.miscProperties.taskRecords;
    function newRecordFunc(record, oldStage, newStage) {
        const stringObj = JSON.stringify(record);
        const replacedString = stringObj.replaceAll(oldStage, newStage);
        return JSON.parse(replacedString);
    }
    recordsArr.forEach((record) => {
        const stagePath = record.data.record.fields[PGDE9.Stage];
        const oldStage = stagePath[0].name;
        const newRecord = newRecordFunc(record.record, oldStage, newStage);
        console.log(newRecord);
        let requestObj = {};
        for (key in newRecord.fields) {
            const indexOfDot = key.indexOf(".");
            const newKey = key.slice(indexOfDot + 1);

            requestObj.Name = newRecord.fields[`WorkOrder.Name`];
            requestObj.ID = newRecord.fields[`WorkOrder.ID`];
            let SalesOrderLinesArr = [];
            let SalesOrderLinesObj = {};
            SalesOrderLinesObj.entityUuid = record.entityUuid;
            SalesOrderLinesObj.recordUuid =
                newRecord.fields[`WorkOrder.SalesOrderLines`][0].uuid;
            SalesOrderLinesArr.push(SalesOrderLinesObj);
            requestObj.SalesOrderLines = SalesOrderLinesArr;
        }
        console.log(requestObj);
    });
});
