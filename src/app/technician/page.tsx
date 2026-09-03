'use client';

import React, { useState } from 'react';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { PRODUCTS_DATABASE, INITIAL_LOCATION } from '../../data/mockData';
import { LocationInfo, CartItem } from '../../types';
import { MOCK_JOB_CARDS } from '../../data/adminData';
import { JobCardTicket } from '../../types';
import { TechnicianJobCardModal } from '../../components/technician/TechnicianJobCardModal';
import { ReviewModal } from '../../components/reviews/ReviewModal';
import { exportToCSV } from '../../lib/export/exportHelpers';
import {
  Wrench,
  CheckCircle2,
  Clock,
  IndianRupee,
  Star,
  Phone,
  MessageSquare,
  Filter,
  Download,
  ShieldCheck,
} from 'lucide-react';

export default function TechnicianPortalPage() {
  const [location] = useState<LocationInfo>(INITIAL_LOCATION);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [cartItems] = useState<CartItem[]>([]);

  const [jobs, setJobs] = useState<JobCardTicket[]>(MOCK_JOB_CARDS);
  const [selectedJob, setSelectedJob] = useState<JobCardTicket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Technician Metrics derived from service_platform/worker/my_earnings.php
  const totalJobs = jobs.length;
  const pendingJobs = jobs.filter((j) => j.status === 'Received' || j.status === 'Diagnosing').length;
  const repairedJobs = jobs.filter((j) => j.status === 'Repaired' || j.status === 'Delivered / Closed').length;
  
  // Calculate total monthly technician earnings (e.g. ₹450 per completed job + parts fee)
  const totalEarnings = repairedJobs * 450 + 1200;

  const filteredJobs = jobs.filter((job) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'pending') return job.status === 'Received' || job.status === 'Diagnosing';
    if (statusFilter === 'approved') return job.status === 'Approved / Parts Ordered';
    if (statusFilter === 'completed') return job.status === 'Repaired' || job.status === 'Delivered / Closed';
    return true;
  });

  const handleUpdateJob = (updated: JobCardTicket) => {
    setJobs((prev) => prev.map((j) => (j.jobId === updated.jobId ? updated : j)));
  };

  const handleOpenConsole = (job: JobCardTicket) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const handleOpenReview = (job: JobCardTicket) => {
    setReviewTarget(`Job Card #${job.jobId} - ${job.clientName}`);
    setIsReviewOpen(true);
  };

  const handleExportJobsCSV = () => {
    exportToCSV({
      filename: `technician_jobs_${new Date().toISOString().split('T')[0]}.csv`,
      data: jobs.map((j) => ({
        Job_ID: j.jobId,
        Client_Name: j.clientName,
        Client_Phone: j.clientPhone,
        Device_Model: j.deviceModel,
        Reported_Issue: j.reportedIssue,
        Status: j.status,
        Assigned_Tech: j.assignedTechnician,
        Est_Price_INR: j.estimatedPrice,
        Received_Date: j.receivedDate,
      })),
    });
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-400 selection:text-slate-950 font-sans pb-12">
      <Header
        location={location}
        onOpenLocationModal={() => {}}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        cartItems={cartItems}
        onOpenCartDrawer={() => {}}
        allProducts={PRODUCTS_DATABASE}
        onSelectSearchProduct={() => {}}
      />

      {/* Technician Portal Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 border-b border-slate-800 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            {/* Technician Profile Card */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-black text-slate-950 text-2xl shadow-lg border-2 border-amber-300">
                  VK
                </div>
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 rounded-full p-1 border-2 border-slate-900">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-white">Vikram K.</h1>
                  <span className="bg-amber-400/10 text-amber-400 border border-amber-400/30 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                    Verified Lead Specialist
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Field Technician Console • MIDC Nagapur Sector | Skill: Hardware & CCTV
                </p>
                <div className="flex items-center gap-3 text-xs mt-1.5 font-bold text-amber-400">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>4.9 / 5.0 Rating</span>
                  </div>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-300">284 Repaired Devices</span>
                </div>
              </div>
            </div>

            {/* Quick Action Export */}
            <button
              onClick={handleExportJobsCSV}
              className="bg-slate-800 hover:bg-slate-700 text-amber-400 font-black text-xs px-4 py-3 rounded-2xl border border-slate-700 transition shadow flex items-center justify-center gap-2 self-start md:self-auto"
            >
              <Download className="w-4 h-4" />
              <span>Export Assigned Jobs (CSV)</span>
            </button>

          </div>

          {/* Metrics Grid (Adapted from service_platform/worker/my_earnings.php) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs font-extrabold uppercase">
                <span>Assigned Jobs</span>
                <Wrench className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-black text-white mt-2">{totalJobs}</div>
              <p className="text-[11px] text-slate-400 font-medium mt-1">Total active repair tickets</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-amber-400 text-xs font-extrabold uppercase">
                <span>In Progress</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-400 mt-2">{pendingJobs}</div>
              <p className="text-[11px] text-slate-400 font-medium mt-1">Diagnostic & repair stage</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-emerald-400 text-xs font-extrabold uppercase">
                <span>Completed</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-400 mt-2">{repairedJobs}</div>
              <p className="text-[11px] text-slate-400 font-medium mt-1">Repaired & delivered</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-blue-400 text-xs font-extrabold uppercase">
                <span>Technician Payout</span>
                <IndianRupee className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-black text-blue-400 mt-2">₹{totalEarnings.toLocaleString('en-IN')}</div>
              <p className="text-[11px] text-slate-400 font-medium mt-1">Monthly estimated commission</p>
            </div>
          </div>

        </div>
      </section>

      {/* Main Repair Job Requests List */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 space-y-6">
        
        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <Filter className="w-4 h-4 text-amber-400" />
            <span>Filter Repair Tickets:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All Jobs' },
              { id: 'pending', label: 'Diagnosing / Pending' },
              { id: 'approved', label: 'Approved / Parts' },
              { id: 'completed', label: 'Completed' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`text-xs font-extrabold px-3.5 py-2 rounded-xl transition ${
                  statusFilter === tab.id
                    ? 'bg-amber-400 text-slate-950 shadow'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Job Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <div
              key={job.jobId}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-slate-700 transition shadow-lg space-y-4 flex flex-col justify-between"
            >
              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="font-mono text-xs font-black text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2.5 py-1 rounded-full">
                    #{job.jobId}
                  </span>
                  
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${
                      job.status === 'Repaired' || job.status === 'Delivered / Closed'
                        ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/30'
                        : job.status === 'Approved / Parts Ordered'
                        ? 'bg-amber-400/10 text-amber-400 border-amber-400/30'
                        : 'bg-blue-400/10 text-blue-400 border-blue-400/30'
                    }`}
                  >
                    {job.status}
                  </span>
                </div>

                {/* Device Title & Issue */}
                <div className="mt-4">
                  <h3 className="font-black text-white text-base leading-snug">{job.deviceModel}</h3>
                  <div className="text-xs text-slate-400 font-medium mt-1">
                    Client: <span className="text-slate-200 font-bold">{job.clientName}</span> ({job.clientPhone})
                  </div>
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-slate-300 font-medium mt-3 leading-relaxed">
                    <span className="text-amber-400 font-extrabold">Reported Issue: </span>
                    {job.reportedIssue}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`tel:${job.clientPhone}`}
                    className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 border border-slate-700"
                  >
                    <Phone className="w-3.5 h-3.5 text-blue-400" />
                    <span>Call Client</span>
                  </a>

                  <button
                    onClick={() => {
                      const msg = `IT Service Hub Workshop Update 🛠️\nJob Card #${job.jobId}\nDevice: ${job.deviceModel}\nStatus: ${job.status}\nEstimated Cost: ₹${job.estimatedPrice}`;
                      window.open(`https://wa.me/91${job.clientPhone}?text=${encodeURIComponent(msg)}`, '_blank');
                    }}
                    className="bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 border border-emerald-800/40"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenConsole(job)}
                    className="flex-1 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs py-3 rounded-2xl transition shadow flex items-center justify-center gap-1.5"
                  >
                    <Wrench className="w-4 h-4" />
                    <span>Open Repair Console</span>
                  </button>

                  <button
                    onClick={() => handleOpenReview(job)}
                    title="Write Review"
                    className="bg-slate-800 hover:bg-slate-700 text-amber-400 p-3 rounded-2xl transition border border-slate-700 flex items-center justify-center"
                  >
                    <Star className="w-4 h-4 fill-amber-400" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>

      </section>

      {/* Technician Job Execution Modal */}
      <TechnicianJobCardModal
        job={selectedJob}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdateJob={handleUpdateJob}
      />

      {/* Review Modal */}
      <ReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        targetTitle={reviewTarget}
      />

      <Footer />
    </main>
  );
}
