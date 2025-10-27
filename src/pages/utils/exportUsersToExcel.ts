import * as XLSX from "xlsx";

/**
 * Exports User data to Excel file
 * @param data - Array of users
 * @param filename - Output file name (default: User_Report)
 */
export const exportUsersToExcel = (data: any[], filename = "User_Report") => {
  if (!data || data.length === 0) {
    alert("No user data available to export.");
    return;
  }

  // 🧩 Prepare worksheet data
  const worksheetData = data.map((item, index) => ({
    "#": index + 1,
    "User ID": item._id || "N/A",
    "Full Name": item.fullname || `${item.firstname ?? ""} ${item.lastname ?? ""}`.trim() || "N/A",
    "Email": item.email || "N/A",
    "User Type": item.userType || "N/A",
    "Status": item.status || "Active",
    "Created At": new Date(item._creationTime || item.createdAt || Date.now()).toLocaleDateString(),
  }));

  // 📄 Create a new workbook and add the worksheet
  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

  // ✨ Auto-size columns
  const columnWidths = Object.keys(worksheetData[0]).map((key) => ({
    wch: Math.max(key.length + 2, 15),
  }));
  worksheet["!cols"] = columnWidths;

  // 💾 Export file
  XLSX.writeFile(workbook, `${filename}.xlsx`);
  alert("User Excel exported successfully!");
};
