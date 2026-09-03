'use client';

import React, { useState } from 'react';
import { JobCardTicket, JobStatusType, Product } from '../../types';
import { MOCK_JOB_CARDS } from '../../data/adminData';
import { Ticket, Plus, MessageSquare, Download, FileText, Wrench, Barcode, Printer, FileSpreadsheet } from 'lucide-react';
import { exportToCSV } from '../../lib/export/exportHelpers';
import { QuotationGeneratorModal } from '../quotation/QuotationGeneratorModal';
import { BarcodeScanner } from '../pos/BarcodeScanner';
import { InvoicePrintModal } from '../pos/InvoicePrintModal';
import { PRODUCTS_DATABASE } from '../../data/mockData';
import Link from 'next/link';

interface RepairJobsModuleProps {
  showAddModal: boolean;
  setShowAddModal: (show: boolean) => void;
}

export const RepairJobsModule: React.FC<RepairJobsModuleProps> = ({
  showAddModal,
  setShowAddModal,
}) => {
  const [tickets, setTickets] = useState<JobCardTicket[]>(MOCK_JOB_CARDS);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const statusOptions: JobStatusType[] = [
    'Received',
    'Diagnosing',
    'Approved / Parts Ordered',
    'Repaired',
    'Delivered / Closed',
  ];

  const filteredTickets = tickets.filter((t) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'pending') return t.status === 'Received' || t.status === 'Diagnosing';
    if (statusFilter === 'approved') return t.status === 'Approved / Parts Ordered';
    if (statusFilter === 'repaired') return t.status === 'Repaired' || t.status === 'Delivered / Closed';
    return true;
  });

  const handleStatusChange = (jobId: string, newStatus: JobStatusType) => {
    setTickets((prev) =>
      prev.map((t) => (t.jobId === jobId ? { ...t, status: newStatus } : t))
    );
  };

  const handleTechChange = (jobId: string, tech: string) => {
    setTickets((prev) =>
      prev.map((t) => (t.jobId === jobId ? { ...t, assignedTechnician: tech } : t))
    );
  };

  const handleSendWhatsAppUpdate = (job: JobCardTicket) => {
    const text = `IT Service Hub Workshop Update! 🛠️\nJob ID: #${job.jobId}\nDevice: ${job.deviceModel}\nStatus: ${job.status}\nAssigned Tech: ${job.assignedTechnician}\nEstimated Cost: ₹${job.estimatedPrice}\nTrack Online: https://itservicehub.com/track/${job.jobId}`;
    window.open(`https://wa.me/91${job.clientPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleExportCSV = () => {
    exportToCSV({
      filename: `admin_repair_jobs_${new Date().toISOString().split('T')[0]}.csv`,
      data: tickets.map((t) => ({
        Job_ID: t.jobId,
        Client_Name: t.clientName,
        Client_Phone: t.clientPhone,
        Device_Model: t.deviceModel,
        Reported_Issue: t.reportedIssue,
        Status: t.status,
        Assigned_Technician: t.assignedTechnician,
        Est_Price_INR: t.estimatedPrice,
        Received_Date: t.receivedDate,
      })),
    });
  };

  const handleScanProductMatched = (scannedProduct: Product) => {
    alert(`Barcode Scanned: "${scannedProduct.name}" (SKU: ${scannedProduct.id}) Added to POS Quick Bill!`);
    setShowScanner(false);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h3 className="font-black text-lg text-slate-900 leading-tight flex items-center gap-2">
            <Ticket className="w-5 h-5 text-amber-500" />
            <span>Digital Repair Job Cards & POS Billing Desk</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Scan barcodes, log workshop devices, trigger Bluetooth thermal invoices, and generate CA reports
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* POS Barcode Scanner Button */}
          <button
            onClick={() => setShowScanner(true)}
            className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl transition shadow flex items-center gap-1.5"
          >
            <Barcode className="w-4 h-4" />
            <span>POS Scanner</span>
          </button>

          {/* Thermal ESC/POS Invoice Button */}
          <button
            onClick={() => setShowPrintModal(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl transition shadow flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span>Thermal Invoice</span>
          </button>

          {/* CA Reports Page Link */}
          <Link
            href="/admin/reports"
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold text-xs px-3.5 py-2 rounded-xl transition border border-emerald-200 flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>GST Reports</span>
          </Link>

          <button
            onClick={() => setShowQuotationModal(true)}
            className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-extrabold text-xs px-3.5 py-2 rounded-xl transition border border-blue-200 flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>B2B Quote</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs (Adapted from legacy admin/manage_bookings.php) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          {[
            { id: 'all', label: 'All Jobs' },
            { id: 'pending', label: 'Received / Diagnosing' },
            { id: 'approved', label: 'Parts Ordered' },
            { id: 'repaired', label: 'Repaired / Delivered' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl transition ${
                statusFilter === tab.id
                  ? 'bg-slate-900 text-white font-extrabold shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="text-xs text-slate-600 hover:text-slate-900 font-bold flex items-center gap-1 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <Link
            href="/technician"
            className="text-xs text-amber-700 font-bold bg-amber-50 px-3 py-1 rounded-lg border border-amber-200 flex items-center gap-1"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Technician Portal</span>
          </Link>
        </div>
      </div>

      {/* Interactive Repair Job Table */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3.5">Job ID</th>
                <th className="p-3.5">Client & Device Model</th>
                <th className="p-3.5">Reported Issue</th>
                <th className="p-3.5">Live Status Dropdown</th>
                <th className="p-3.5">Assigned Tech</th>
                <th className="p-3.5 text-right">Est Cost</th>
                <th className="p-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium text-slate-700">
              {filteredTickets.map((job) => (
                <tr key={job.jobId} className="hover:bg-slate-50 transition">
                  <td className="p-3.5 font-bold font-mono text-slate-900">#{job.jobId}</td>

                  <td className="p-3.5">
                    <div className="font-extrabold text-slate-900">{job.deviceModel}</div>
                    <div className="text-[11px] text-slate-500 font-medium">{job.clientName} ({job.clientPhone})</div>
                  </td>

                  <td className="p-3.5 max-w-xs text-slate-600 font-medium leading-snug">{job.reportedIssue}</td>

                  {/* Status Dropdown */}
                  <td className="p-3.5">
                    <select
                      value={job.status}
                      onChange={(e) => handleStatusChange(job.jobId, e.target.value as JobStatusType)}
                      className={`px-2.5 py-1 rounded-xl font-bold text-xs outline-none border cursor-pointer ${
                        job.status === 'Repaired' || job.status === 'Delivered / Closed'
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-black'
                          : job.status === 'Approved / Parts Ordered'
                          ? 'bg-amber-100 text-amber-900 border-amber-300 font-black'
                          : 'bg-slate-100 text-slate-800 border-slate-300'
                      }`}
                    >
                      {statusOptions.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </td>

                  {/* Tech Dropdown */}
                  <td className="p-3.5">
                    <select
                      value={job.assignedTechnician}
                      onChange={(e) => handleTechChange(job.jobId, e.target.value)}
                      className="px-2 py-1 bg-slate-100 border border-slate-300 text-slate-900 font-bold rounded-lg outline-none text-xs"
                    >
                      <option value="Vikram K.">Vikram K.</option>
                      <option value="Suresh M.">Suresh M.</option>
                      <option value="Rahul P.">Rahul P.</option>
                    </select>
                  </td>

                  <td className="p-3.5 text-right font-black text-slate-900">₹{job.estimatedPrice}</td>

                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => handleSendWhatsAppUpdate(job)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] px-2.5 py-1.5 rounded-lg transition inline-flex items-center gap-1 shadow-sm"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <BarcodeScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScanSuccess={handleScanProductMatched}
      />

      <InvoicePrintModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        cartItems={[
          {
            product: PRODUCTS_DATABASE[0],
            quantity: 1,
            isSelected: true,
          },
          {
            product: PRODUCTS_DATABASE[2],
            quantity: 2,
            isSelected: true,
          },
        ]}
      />

      <QuotationGeneratorModal
        isOpen={showQuotationModal}
        onClose={() => setShowQuotationModal(false)}
      />

    </div>
  );
};
