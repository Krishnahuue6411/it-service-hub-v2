/**
 * Data Export & Document Printing Helper Utilities
 * Adapted from legacy service_platform CSV export scripts to Next.js TypeScript
 */

export interface ExportCSVOptions {
  filename?: string;
  data: Record<string, any>[];
}

export function exportToCSV({ filename = 'export.csv', data }: ExportCSVOptions) {
  if (!data || data.length === 0) {
    alert('No data available to export.');
    return;
  }

  // Extract column headers
  const headers = Object.keys(data[0]);

  // Format row values with proper quoting for CSV compliance
  const csvRows = data.map((row) =>
    headers
      .map((header) => {
        const val = row[header] ?? '';
        const escaped = String(val).replace(/"/g, '""');
        return `"${escaped}"`;
      })
      .join(',')
  );

  // Combine headers and rows
  const csvContent = [headers.join(','), ...csvRows].join('\n');

  // Create downloadable Blob
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export interface QuotationLineItem {
  description: string;
  hsnCode: string;
  qty: number;
  unitPrice: number;
  gstRate: number; // e.g. 18
}

export interface QuotationData {
  quoteNo: string;
  date: string;
  validUntil: string;
  clientName: string;
  clientCompany?: string;
  clientGstin?: string;
  clientAddress: string;
  items: QuotationLineItem[];
  notes?: string;
}

export function generatePrintableQuotation(quote: QuotationData) {
  const subtotal = quote.items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
  const totalGst = quote.items.reduce((sum, item) => sum + (item.qty * item.unitPrice * (item.gstRate / 100)), 0);
  const grandTotal = subtotal + totalGst;

  const htmlWindow = window.open('', '_blank');
  if (!htmlWindow) {
    alert('Please allow popups to generate the PDF / Print view');
    return;
  }

  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>B2B GST Quotation - ${quote.quoteNo}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; background: #fff; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0284c7; padding-bottom: 20px; margin-bottom: 30px; }
        .company-logo { font-size: 24px; font-weight: 900; color: #0f172a; }
        .company-tag { font-size: 12px; color: #64748b; font-weight: 600; }
        .quote-badge { background: #e0f2fe; color: #0369a1; padding: 6px 16px; border-radius: 20px; font-weight: 800; font-size: 14px; text-transform: uppercase; }
        .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
        .box { background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0; }
        .box h4 { margin: 0 0 8px 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
        .box p { margin: 3px 0; font-size: 13px; font-weight: 600; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th { background: #0f172a; color: #fff; padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; font-weight: 700; }
        td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: 500; }
        .text-right { text-align: right; }
        .totals-section { width: 320px; margin-left: auto; background: #f8fafc; border-radius: 12px; padding: 16px; border: 1px solid #e2e8f0; }
        .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
        .grand-total { font-weight: 900; font-size: 16px; color: #0284c7; border-top: 2px solid #0284c7; padding-top: 10px; margin-top: 6px; }
        .footer { margin-top: 50px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 11px; color: #94a3b8; }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 20px; text-align: right;">
        <button onclick="window.print()" style="background: #0284c7; color: white; border: none; padding: 10px 24px; border-radius: 8px; font-weight: bold; cursor: pointer;">🖨️ Print / Save PDF</button>
      </div>

      <div class="header">
        <div>
          <div class="company-logo">⚡ IT SERVICE HUB</div>
          <div class="company-tag">M45 MIDC Nagapur, Ahilyanagar - 414111 | GSTIN: 27AAAAA0000A1Z5</div>
          <div class="company-tag">Phone: +91 98765 43210 | Email: b2b@itservicehub.com</div>
        </div>
        <div>
          <span class="quote-badge">Official Quotation</span>
          <div style="margin-top: 10px; font-size: 12px; font-weight: 700; text-align: right;">Ref #${quote.quoteNo}</div>
          <div style="font-size: 11px; color: #64748b; text-align: right;">Date: ${quote.date}</div>
        </div>
      </div>

      <div class="details-grid">
        <div class="box">
          <h4>B2B Client Details</h4>
          <p style="font-size: 15px; color: #0f172a;">${quote.clientName}</p>
          ${quote.clientCompany ? `<p>🏢 ${quote.clientCompany}</p>` : ''}
          ${quote.clientGstin ? `<p>🏷️ GSTIN: ${quote.clientGstin}</p>` : ''}
          <p>📍 ${quote.clientAddress}</p>
        </div>

        <div class="box">
          <h4>Proposal Parameters</h4>
          <p>Quote Ref: <strong>#${quote.quoteNo}</strong></p>
          <p>Issue Date: <strong>${quote.date}</strong></p>
          <p>Validity: <strong>${quote.validUntil}</strong></p>
          <p>Delivery: <strong>Express 2-Hour MIDC Dispatch</strong></p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Item Description</th>
            <th>HSN Code</th>
            <th class="text-right">Qty</th>
            <th class="text-right">Unit Price (₹)</th>
            <th class="text-right">GST Rate</th>
            <th class="text-right">Total (₹)</th>
          </tr>
        </thead>
        <tbody>
          ${quote.items
            .map((item, index) => {
              const itemSub = item.qty * item.unitPrice;
              const itemGst = itemSub * (item.gstRate / 100);
              const itemTotal = itemSub + itemGst;
              return `
                <tr>
                  <td>${index + 1}</td>
                  <td><strong>${item.description}</strong></td>
                  <td><code>${item.hsnCode}</code></td>
                  <td class="text-right">${item.qty}</td>
                  <td class="text-right">₹${item.unitPrice.toLocaleString('en-IN')}</td>
                  <td class="text-right">${item.gstRate}%</td>
                  <td class="text-right">₹${itemTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
              `;
            })
            .join('')}
        </tbody>
      </table>

      <div class="totals-section">
        <div class="totals-row">
          <span>Taxable Subtotal:</span>
          <span>₹${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>
        <div class="totals-row">
          <span>CGST (9%):</span>
          <span>₹${(totalGst / 2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>
        <div class="totals-row">
          <span>SGST (9%):</span>
          <span>₹${(totalGst / 2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>
        <div class="totals-row grand-total">
          <span>Grand Total:</span>
          <span>₹${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      ${quote.notes ? `<div style="margin-top: 30px; background: #fffbe0; padding: 15px; border-radius: 8px; font-size: 12px; color: #854d0e;"><strong>Note:</strong> ${quote.notes}</div>` : ''}

      <div class="footer">
        This is a computer-generated quotation issued by IT Service Hub, Ahilyanagar. Terms & Conditions apply.
      </div>
    </body>
    </html>
  `;

  htmlWindow.document.write(printContent);
  htmlWindow.document.close();
}
