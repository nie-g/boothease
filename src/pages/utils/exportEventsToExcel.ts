import * as XLSX from "xlsx";

export const exportEventToExcel = (data: any[], filename = "Event_Report") => {
  if (!data || data.length === 0) {
    alert("No event data available to export.");
    return;
  }

  // 🧩 Prepare worksheet data
  const worksheetData = data.map((item, index) => {
    // ✅ Organizer Name Fix
    const organizer =
      item.organizer ||
      item.organizerName ||
      (item.organizerFirstName && item.organizerLastName
        ? `${item.organizerFirstName} ${item.organizerLastName}`
        : "Unknown");

    return {
      "#": index + 1,
      "Event ID": item.eventId || item._id || "N/A",
      "Event Name": item.name || item.eventName || "N/A",
      "Organizer": organizer,
      "Location": item.location || item.venue || "N/A",
      "Date Range": item.dateRange || "N/A",
      "Status": item.status || "N/A",
      "Created At": item.createdAt || "N/A",
    };
  });

  // 📄 Create a new workbook and add the worksheet
  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Events");

  // ✨ Auto-size columns
  const columnWidths = Object.keys(worksheetData[0]).map((key) => ({
    wch: Math.max(key.length + 2, 15),
  }));
  worksheet["!cols"] = columnWidths;

  // 💾 Export file
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};
