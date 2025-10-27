import * as XLSX from "xlsx";

/**
 * Exports Booth data to Excel file
 * @param data - Array of booths
 * @param filename - Output file name (default: Booth_Report)
 */
export const exportBoothToExcel = (data: any[], filename = "Booth_Report") => {
  if (!data || data.length === 0) {
    alert("No booth data available to export.");
    return;
  }

  // 🧩 Prepare worksheet data
  const worksheetData = data.map((item, index) => {
    // ✅ Owner Name Fix
    const owner =
      item.owner ||
      item.ownerFullName ||
      item.ownerName ||
      (item.ownerFirstName && item.ownerLastName
        ? `${item.ownerFirstName} ${item.ownerLastName}`
        : "Unknown");

    // ✅ Price Formatting Fix - Philippine Peso
    let priceValue = 0;
    if (item.price) {
      // Remove any existing peso symbol and parse the number
      const cleanPrice = item.price.toString().replace(/[₱,]/g, "").trim();
      priceValue = parseFloat(cleanPrice) || 0;
    }

    const price = priceValue > 0
      ? `₱${priceValue.toLocaleString("en-PH", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : "N/A";

    return {
      "#": index + 1,
      "Booth Name": item.name || "N/A",
      "Owner": owner,
      "Location": item.location || "N/A",
      "Price": price,
      "Status": item.status || "N/A",
      "Created At": new Date(item._creationTime || item.createdAt || Date.now()).toLocaleDateString(),
    };
  });

  // 📄 Create a new workbook and add the worksheet
  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Booths");

  // ✨ Auto-size columns
  const columnWidths = Object.keys(worksheetData[0]).map((key) => ({
    wch: Math.max(key.length + 2, 15),
  }));
  worksheet["!cols"] = columnWidths;

  // 💾 Export file
  XLSX.writeFile(workbook, `${filename}.xlsx`);
  alert("Booth Excel exported successfully!");
};
