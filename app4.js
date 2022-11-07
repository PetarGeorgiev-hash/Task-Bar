topAppletRef.fireEvent("onCommandRequest", {
    applet: [{ id: "ResearchMetricsWorkOrderDetails" }],
    selectedRowsData: { recordId: `${e.miscProperties}` },
});
