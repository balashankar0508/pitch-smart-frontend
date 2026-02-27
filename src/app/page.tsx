"use client";

import { Users, Flame, Percent, Activity } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/components/AuthProvider';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

export default function DashboardPage() {
  const { user } = useAuth();
  const customerId = user?.customerId;
  const [leads, setLeads] = useState<any[]>([]);

  useEffect(() => {
    if (customerId) {
      fetchLeads();
    }
  }, [customerId]);

  const fetchLeads = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/leads?customerId=${customerId}`);
      setLeads(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("Failed to fetch leads", e);
      setLeads([]);
    }
  };

  if (!customerId) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
        <Users className="h-16 w-16 text-slate-300" />
        <h2 className="text-xl font-semibold text-slate-500">No Data Available</h2>
        <p className="text-slate-400">Dashboard will populate once leads are created.</p>
      </div>
    );
  }

  const safeLeads = Array.isArray(leads) ? leads : [];
  const totalLeads = safeLeads.length;
  const hotLeads = safeLeads.filter(l => l.status === 'HOT').length;
  const convertedLeads = safeLeads.filter(l => l.status === 'CONVERTED').length;
  const conversionRate = totalLeads === 0 ? 0 : ((convertedLeads / totalLeads) * 100).toFixed(1);

  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        fill: true,
        label: 'Leads Generated',
        data: [0, 0, 0, 0, 0, 0, totalLeads], // Simplified demo data
        borderColor: 'rgb(79, 70, 229)',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.4,
      },
      {
        fill: true,
        label: 'Hot Leads',
        data: [0, 0, 0, 0, 0, 0, hotLeads], // Simplified demo data
        borderColor: 'rgb(249, 115, 22)',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in zoom-in-95 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500 mt-1">Track your performance and latest lead conversions.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Leads', value: totalLeads.toString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-100', trend: 'Lifetime' },
          { label: 'Hot Leads', value: hotLeads.toString(), icon: Flame, color: 'text-orange-600', bg: 'bg-orange-100', trend: 'Current' },
          { label: 'Conversion Rate', value: `${conversionRate}%`, icon: Percent, color: 'text-emerald-600', bg: 'bg-emerald-100', trend: `${convertedLeads} Total Converted` },
          { label: 'Messages Sent', value: '--', icon: Activity, color: 'text-purple-600', bg: 'bg-purple-100', trend: 'System Data' },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${kpi.bg}`}>
                <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
              </div>
            </div>
            <h3 className="text-slate-500 font-medium text-sm">{kpi.label}</h3>
            <div className="text-3xl font-bold text-slate-900 mt-1 mb-2">{kpi.value}</div>
            <p className="text-xs font-medium text-emerald-600">{kpi.trend}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mb-8 h-96">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Lead Acquisition Flow</h3>
        <div className="h-[300px] w-full">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}
