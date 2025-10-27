import * as XLSX from "xlsx";

export const exportReservationToExcel = (data: any[], filename = "Booth_Reservation_Report") => {
  if (!data || data.length === 0) {
    alert("No reservation data available to export.");
    return;
  }

  // 🧩 Prepare worksheet data
  const worksheetData = data.map((item, index) => ({
    "#": index + 1,
    "Reservation ID": item.reservationId || item._id || "Unknown",
    "Owner Name": item.owner || item.ownerName || "Unknown",
    "Booth Name": item.booth || item.boothName || "Unknown",
    "Location": item.location || "Unknown",
    "Reservation Date": item.createdAt || "Unknown",
    "Start Date": item.startDate || "Unknown",
    "End Date": item.endDate || "Unknown",
    "Status": item.status || "Pending",
    "Total Amount": item.totalAmount || "N/A",
    "Created At": item.createdAt || "Unknown",
  }));

  // 📄 Create a new workbook and add the worksheet
  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Reservations");

  // ✨ Auto-size columns
  const columnWidths = Object.keys(worksheetData[0]).map((key) => ({
    wch: Math.max(key.length + 2, 15),
  }));
  worksheet["!cols"] = columnWidths;

  // 💾 Export file
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};
