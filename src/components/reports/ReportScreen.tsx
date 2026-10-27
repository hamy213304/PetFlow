import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  Award,
  ChevronRight,
  Filter,
  BarChart2,
  PieChart as PieIcon,
  Sparkles
} from 'lucide-react';
import {
  getTodayAppointmentMetrics,
  getTodayCustomerMetrics,
  getTodayRevenueMetrics,
  getRevenueChartData,
  getTopSellingGoods,
  getPopularServices,
  TimeFilterPeriod
} from '../../services/reportService';
import { getAppointments } from '../../services/storage';
import { formatVND, formatTimeVN, formatDateVN } from '../../utils/formatters';
import { Appointment } from '../../types/petflow';

interface ReportScreenProps {
  onOpenAppointment: (appointmentId: string) => void;
  onNavigateToTab: (tab: 'catalog' | 'customers') => void;
}

export const ReportScreen: React.FC<ReportScreenProps> = ({
  onOpenAppointment,
  onNavigateToTab
}) => {
  const [revenuePeriod, setRevenuePeriod] = useState<TimeFilterPeriod>('day');
  const [aptMetrics, setAptMetrics] = useState(getTodayAppointmentMetrics());
  const [custMetrics, setCustMetrics] = useState(getTodayCustomerMetrics());
  const [revMetrics, setRevMetrics] = useState(getTodayRevenueMetrics());
  const [chartData, setChartData] = useState(getRevenueChartData('day'));
  const [topGoods, setTopGoods] = useState(getTopSellingGoods('month'));
  const [popularServices, setPopularServices] = useState(getPopularServices('month'));
  const [upcomingApts, setUpcomingApts] = useState<Appointment[]>([]);

  const reloadMetrics = () => {
    setAptMetrics(getTodayAppointmentMetrics());
    setCustMetrics(getTodayCustomerMetrics());
    setRevMetrics(getTodayRevenueMetrics());
    setChartData(getRevenueChartData(revenuePeriod));
    setTopGoods(getTopSellingGoods(revenuePeriod));
    setPopularServices(getPopularServices(revenuePeriod));

    const nowMs = Date.now();
    const apts = getAppointments()
      .filter(a => !a.isCanceled && new Date(a.startDateTime).getTime() >= nowMs)
      .slice(0, 4);
    setUpcomingApts(apts);
  };

  useEffect(() => {
    reloadMetrics();
    const handleDataChange = () => reloadMetrics();
    window.addEventListener('petflow_data_change', handleDataChange);
    return () => window.removeEventListener('petflow_data_change', handleDataChange);
  }, [revenuePeriod]);

  // Max value for chart scaling
  const maxChartVal = Math.max(...chartData.points.map(p => p.value), 1);

  // Pie chart angles
  const totalPieCusts = custMetrics.totalVisits || 1;
  const newPct = Math.round((custMetrics.newCustomers / totalPieCusts) * 100);
  const retPct = Math.round((custMetrics.returningCustomers / totalPieCusts) * 100);
  const retlPct = Math.max(0, 100 - newPct - retPct);

  return (
    <div className="pb-24 px-4 pt-3 max-w-md mx-auto space-y-4">
      {/* Overview Header Card */}
      <div className="bg-gradient-to-r from-[#17365D] to-[#1F4E79] rounded-2xl p-4 text-white shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-white/10 rounded-lg">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </span>
            <div>
              <h2 className="text-sm font-bold tracking-tight">Hôm nay tại PetFlow</h2>
              <p className="text-[11px] text-blue-200">
                {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-400/30">
            Trực tiếp
          </span>
        </div>

        {/* 3 Quick Highlight KPIs */}
        <div className="grid grid-cols-3 gap-2 mt-3.5 pt-3 border-t border-white/10 text-center">
          <div>
            <span className="text-[10px] text-blue-200 font-medium">Lịch hẹn</span>
            <p className="text-base font-extrabold text-white mt-0.5 font-mono">{aptMetrics.totalCount}</p>
          </div>
          <div className="border-x border-white/10">
            <span className="text-[10px] text-blue-200 font-medium">Lượt khách</span>
            <p className="text-base font-extrabold text-white mt-0.5 font-mono">{custMetrics.totalVisits}</p>
          </div>
          <div>
            <span className="text-[10px] text-blue-200 font-medium">Doanh thu</span>
            <p className="text-xs font-extrabold text-amber-300 mt-1 font-mono truncate">
              {formatVND(revMetrics.totalRevenue)}
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 1: Lịch hẹn hôm nay (SRS 11.1) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Lịch hẹn hôm nay</h3>
          </div>
          <span className="text-xs font-mono font-bold text-blue-600">
            {aptMetrics.completedCount}/{aptMetrics.totalCount} hoàn thành
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] text-slate-500">So với hôm qua</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className={`text-base font-bold font-mono ${aptMetrics.percentageChangeVsYesterday >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {aptMetrics.percentageChangeVsYesterday >= 0 ? `+${aptMetrics.percentageChangeVsYesterday}%` : `${aptMetrics.percentageChangeVsYesterday}%`}
              </span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] text-slate-500">Tỷ lệ có hóa đơn</span>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-base font-bold text-slate-800 font-mono">{aptMetrics.completionRate}%</span>
              <div className="w-10 h-10 relative flex items-center justify-center">
                <svg className="w-9 h-9 transform -rotate-90">
                  <circle cx="18" cy="18" r="14" stroke="currentColor" strokeWidth="3" className="text-slate-200" fill="transparent" />
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray={88}
                    strokeDashoffset={88 - (88 * aptMetrics.completionRate) / 100}
                    className="text-blue-600"
                    fill="transparent"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Khách hàng hôm nay & Biểu đồ tròn (SRS 11.1) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Khách hàng hôm nay</h3>
          </div>
          <span className="text-xs font-mono font-bold text-slate-700">{custMetrics.totalVisits} lượt giao dịch</span>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-3 text-center">
          <div className="p-2.5 bg-blue-50/60 rounded-xl border border-blue-100">
            <span className="text-[10px] text-blue-700 font-medium">Khách mới</span>
            <p className="text-sm font-bold text-blue-900 mt-0.5 font-mono">{custMetrics.newCustomers}</p>
            <span className="text-[10px] text-blue-600 font-mono">({newPct}%)</span>
          </div>

          <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100">
            <span className="text-[10px] text-emerald-700 font-medium">Khách cũ</span>
            <p className="text-sm font-bold text-emerald-900 mt-0.5 font-mono">{custMetrics.returningCustomers}</p>
            <span className="text-[10px] text-emerald-600 font-mono">({retPct}%)</span>
          </div>

          <div className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-100">
            <span className="text-[10px] text-amber-700 font-medium">Khách lẻ</span>
            <p className="text-sm font-bold text-amber-900 mt-0.5 font-mono">{custMetrics.retailCustomers}</p>
            <span className="text-[10px] text-amber-600 font-mono">({retlPct}%)</span>
          </div>
        </div>

        {/* Breakdown bar visual */}
        <div className="mt-3.5 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
            <span className="flex items-center gap-1 font-medium"><PieIcon className="w-3.5 h-3.5" /> Phân bố lượt khách</span>
            <span className="text-[10px] text-slate-400">Tự động tính từ hóa đơn</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full flex overflow-hidden">
            <div style={{ width: `${newPct}%` }} className="bg-blue-600 h-full" title={`Khách mới: ${newPct}%`} />
            <div style={{ width: `${retPct}%` }} className="bg-emerald-500 h-full" title={`Khách cũ: ${retPct}%`} />
            <div style={{ width: `${retlPct}%` }} className="bg-amber-400 h-full" title={`Khách lẻ: ${retlPct}%`} />
          </div>
        </div>
      </div>

      {/* SECTION 3: Thu chi hôm nay (Doanh thu & Giá vốn COGS - SRS 11.1 & 11.2) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Thu chi & Doanh thu thuần</h3>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">{revMetrics.invoiceCount} hóa đơn</span>
        </div>

        <div className="space-y-2.5 mt-3">
          <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
            <span className="text-xs text-slate-600">Tổng thu (Hóa đơn hoàn thành):</span>
            <span className="text-xs font-bold font-mono text-slate-900">{formatVND(revMetrics.totalRevenue)}</span>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
            <div>
              <span className="text-xs text-slate-600">Tổng giá vốn hàng bán (COGS):</span>
              <p className="text-[10px] text-slate-400">Tính theo giá vốn snapshot các dòng hàng hóa</p>
            </div>
            <span className="text-xs font-bold font-mono text-rose-600">-{formatVND(revMetrics.totalCostPrice)}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-emerald-50/70 border border-emerald-200/60 rounded-xl">
            <span className="text-xs font-bold text-emerald-900">Doanh thu thuần ước tính:</span>
            <span className="text-sm font-extrabold font-mono text-emerald-700">{formatVND(revMetrics.netRevenue)}</span>
          </div>
        </div>
      </div>

      {/* SECTION 4: Biểu đồ Doanh thu & Bộ lọc thời gian (SRS 11.1) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Biểu đồ doanh thu</h3>
          </div>

          {/* Time Filter Tabs */}
          <div className="flex p-0.5 bg-slate-100 rounded-lg text-[10px] font-semibold">
            {(['hour', 'day', 'month', 'year'] as TimeFilterPeriod[]).map(p => (
              <button
                key={p}
                onClick={() => setRevenuePeriod(p)}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  revenuePeriod === p ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {p === 'hour' ? 'Giờ' : p === 'day' ? 'Ngày' : p === 'month' ? 'Tháng' : 'Năm'}
              </button>
            ))}
          </div>
        </div>

        {/* Metrics Summary in Selected Period */}
        <div className="flex items-center justify-between my-3 text-xs">
          <div>
            <span className="text-slate-400 text-[11px]">Tổng doanh thu:</span>
            <p className="text-sm font-bold font-mono text-indigo-950">{formatVND(chartData.totalRevenue)}</p>
          </div>
          <div className="text-right">
            <span className="text-slate-400 text-[11px]">Doanh thu thuần:</span>
            <p className="text-sm font-bold font-mono text-emerald-600">{formatVND(chartData.netRevenue)}</p>
          </div>
        </div>

        {/* Bar Chart Visualization */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="h-32 flex items-end gap-1.5 justify-between px-1">
            {chartData.points.map((pt, idx) => {
              const heightPercent = maxChartVal > 0 ? Math.round((pt.value / maxChartVal) * 100) : 0;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center group relative">
                  {/* Tooltip on hover/touch */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-20 font-mono">
                    {formatVND(pt.value)}
                  </div>
                  <div className="w-full max-w-[20px] bg-indigo-100 rounded-t flex items-end justify-center overflow-hidden h-28">
                    <div
                      style={{ height: `${Math.max(heightPercent, 4)}%` }}
                      className={`w-full rounded-t transition-all ${
                        pt.value > 0 ? 'bg-indigo-600' : 'bg-slate-200'
                      }`}
                    />
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 font-mono truncate w-full text-center">
                    {pt.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 5: Lịch hẹn sắp tới (Bấm mở trực tiếp - SRS 11.1) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Lịch hẹn sắp tới</h3>
          </div>
          <button
            onClick={() => onNavigateToTab('customers')}
            className="text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-0.5"
          >
            Xem tất cả <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 mt-2">
          {upcomingApts.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              Không có lịch hẹn sắp tới trong vài giờ tới.
            </div>
          ) : (
            upcomingApts.map(apt => (
              <div
                key={apt.id}
                onClick={() => onOpenAppointment(apt.id)}
                className="py-2.5 flex items-center justify-between hover:bg-slate-50 rounded-xl px-2 cursor-pointer transition-colors"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{apt.customerName}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {apt.services.map(s => s.serviceName).join(', ') || 'Dịch vụ spa'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-[#17365D]">
                    {formatTimeVN(apt.startDateTime)}
                  </span>
                  <p className="text-[10px] text-slate-400">{formatDateVN(apt.startDateTime)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* SECTION 6: Top 5 hàng hóa bán chạy & Dịch vụ phổ biến (SRS 11.1 & 11.2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Top 5 Hàng hóa */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              <h4 className="text-xs font-bold text-slate-800 uppercase">Top hàng hóa</h4>
            </div>
          </div>
          <div className="divide-y divide-slate-100 mt-1">
            {topGoods.length === 0 ? (
              <p className="py-4 text-center text-xs text-slate-400">Chưa có dữ liệu bán hàng</p>
            ) : (
              topGoods.map((item, idx) => (
                <div key={idx} className="py-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-slate-800 truncate">{item.name}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-slate-900 font-mono">{item.quantity} cái</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Dịch vụ phổ biến */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <h4 className="text-xs font-bold text-slate-800 uppercase">Dịch vụ phổ biến</h4>
            </div>
          </div>
          <div className="divide-y divide-slate-100 mt-1">
            {popularServices.length === 0 ? (
              <p className="py-4 text-center text-xs text-slate-400">Chưa có dữ liệu dịch vụ</p>
            ) : (
              popularServices.map((srv, idx) => (
                <div key={idx} className="py-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-slate-800 truncate">{srv.name}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-slate-900 font-mono">{srv.quantity} lượt</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
