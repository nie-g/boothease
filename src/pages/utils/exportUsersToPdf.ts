import jsPDF from "jspdf";

/**
 * Exports User data to a formatted PDF with summary and pagination
 * @param data - Array of users
 * @param fileName - Output file name (default: User_Report)
 */
export const exportUsersToPDF = (data: any[], fileName = "User_Report") => {
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

    // 🧑‍💼 Header
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Boothease", margin, currentY);

    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text("User Report", margin, currentY + 20);

    // 🗓️ Date & Summary
    currentY += 45;
    const currentDate = new Date().toLocaleDateString();
    doc.setFontSize(10);
    doc.text(`Generated: ${currentDate} | Total Users: ${data.length}`, margin, currentY);

    // 🧾 Summary Stats
    const adminCount = data.filter((u) => u.userType?.toLowerCase() === "admin").length;
    const ownerCount = data.filter((u) => u.userType?.toLowerCase() === "owner").length;
    const renterCount = data.filter((u) => u.userType?.toLowerCase() === "renter").length;

    doc.text(
      `Admins: ${adminCount} | Owners: ${ownerCount} | Renters: ${renterCount}`,
      pageWidth - 400,
      currentY
    );

    // 🧱 Table Header
    currentY += 40;
    const rowHeight = 25;
    const colWidths = [40, 150, 200, 180, 150, 100, 100];
    const colPositions = [margin];
    for (let i = 0; i < colWidths.length - 1; i++) {
      colPositions.push(colPositions[i] + colWidths[i]);
    }

    const headers = ["#", "Full Name", "Email", "User Type", "Status", "Created At"];
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

      const rowData = [
        (index + 1).toString(),
       (item.fullname ?? `${item.firstname ?? ""} ${item.lastname ?? ""}`.trim()) || "N/A",
        item.email ?? "N/A",
        item.userType ?? "N/A",
        item.status ?? "Active",
        new Date(item._creationTime || item.createdAt || Date.now()).toLocaleDateString(),
      ];

      rowData.forEach((cell, i) => {
        let text = cell.toString();
        const maxLengths = [3, 25, 30, 20, 12, 10, 12];
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

    doc.text(`Total Users: ${data.length}`, margin, currentY);
    currentY += 15;
    doc.text(`Admins: ${adminCount}`, margin, currentY);
    currentY += 15;
    doc.text(`Owners: ${ownerCount}`, margin, currentY);
    currentY += 15;
    doc.text(`Renters: ${renterCount}`, margin, currentY);

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
    alert("User PDF exported successfully!");
  } catch (err) {
    console.error("PDF export failed:", err);
    alert(`Failed to export User PDF: ${(err as Error).message}`);
  }
};
