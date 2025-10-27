import jsPDF from "jspdf";

/**
 * Exports Booth data to a formatted PDF with summary and pagination
 * @param data - Array of booths
 * @param fileName - Output file name (default: Booth_Report)
 */
export const exportBoothToPDF = (data: any[], fileName = "Booth_Report") => {
  try {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "A4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    let currentY = 50;

    // 🏢 Header
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Boothease", margin, currentY);

    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text("Booth Report", margin, currentY + 20);

    // 🗓️ Date & Summary
    currentY += 45;
    const currentDate = new Date().toLocaleDateString();
    doc.setFontSize(10);
    doc.text(`Generated: ${currentDate} | Total Booths: ${data.length}`, margin, currentY);

    // 🧾 Totals / Summary Stats
    const availableCount = data.filter((b) => b.status?.toLowerCase() === "available").length;
    const reservedCount = data.filter((b) => b.status?.toLowerCase() === "reserved").length;
    const occupiedCount = data.filter((b) => b.status?.toLowerCase() === "occupied").length;
    const maintenanceCount = data.filter((b) => b.status?.toLowerCase() === "maintenance").length;

    doc.text(
      `Available: ${availableCount} | Reserved: ${reservedCount} | Occupied: ${occupiedCount} | Maintenance: ${maintenanceCount}`,
      pageWidth - 480,
      currentY
    );

    // 🧱 Table Header
    currentY += 40;
    const rowHeight = 25;
    const colWidths = [40, 150, 150, 150, 100, 100];
    const colPositions = [margin];
    for (let i = 0; i < colWidths.length - 1; i++) {
      colPositions.push(colPositions[i] + colWidths[i]);
    }

    const headers = ["#", "Booth Name", "Owner", "Location", "Price", "Status"];
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    headers.forEach((header, i) => doc.text(header, colPositions[i] + 5, currentY));
    currentY += 5;
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 15;

    // 📋 Table Rows
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    data.forEach((item, index) => {
      if (currentY + rowHeight > pageHeight - 60) {
        // Add new page
        doc.addPage();
        currentY = 50;
        doc.setFont("helvetica", "bold");
        headers.forEach((header, i) => doc.text(header, colPositions[i] + 5, currentY));
        currentY += 20;
        doc.setFont("helvetica", "normal");
      }

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

      const rowData = [
        (index + 1).toString(),
        item.name ?? "N/A",
        owner,
        item.location ?? "N/A",
        price,
        item.status ?? "N/A",
      ];

      rowData.forEach((cell, i) => {
        let text = cell.toString();
        const maxLengths = [3, 22, 20, 20, 15, 10];
        if (text.length > maxLengths[i]) text = text.substring(0, maxLengths[i] - 3) + "...";
        doc.text(text, colPositions[i] + 5, currentY);
      });

      currentY += rowHeight;
    });

    // 📊 Summary Section
    currentY += 30;
    if (currentY + 80 > pageHeight - 60) {
      doc.addPage();
      currentY = 50;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Summary", margin, currentY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    currentY += 20;

    doc.text(`Total Booths: ${data.length}`, margin, currentY);
    currentY += 15;
    doc.text(`Available: ${availableCount}`, margin, currentY);
    currentY += 15;
    doc.text(`Reserved: ${reservedCount}`, margin, currentY);
    currentY += 15;
    doc.text(`Occupied: ${occupiedCount}`, margin, currentY);
    currentY += 15;
    doc.text(`Maintenance: ${maintenanceCount}`, margin, currentY);

    // 📆 Report Period
    if (data.length > 0) {
      const dates = data
        .map((b) => new Date(b.createdAt ?? b._creationTime))
        .sort((a, b) => a.getTime() - b.getTime());
      const startDate = dates[0].toLocaleDateString();
      const endDate = dates[dates.length - 1].toLocaleDateString();
      currentY += 15;
      doc.text(`Report Period: ${startDate} to ${endDate}`, margin, currentY);
    }

    // 🦶 Footer
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - 80, pageHeight - 20);
      doc.text("Boothease Management System", margin, pageHeight - 20);
    }

    // 💾 Save
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
    doc.save(`${fileName}_${timestamp}.pdf`);
    alert("Booth PDF exported successfully!");
  } catch (err) {
    console.error("PDF export failed:", err);
    alert(`Failed to export Booth PDF: ${(err as Error).message}`);
  }
};
