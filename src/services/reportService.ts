import { Invoice, Appointment, Customer, CatalogItem } from '../types/petflow';
import { getInvoices, getAppointments, getCustomers, getCatalogItems } from './storage';

export type TimeFilterPeriod = 'hour' | 'day' | 'month' | 'year' | 'custom';

export interface TodayAppointmentMetrics {
  totalCount: number;
  percentageChangeVsYesterday: number;
  completionRate: number; // % appointments that have linked invoice
  completedCount: number;
}

export interface TodayCustomerMetrics {
  totalVisits: number;
  newCustomers: number;
  returningCustomers: number;
  retailCustomers: number;
}

export interface TodayRevenueMetrics {
  totalRevenue: number;
  totalCostPrice: number;
  netRevenue: number;
  invoiceCount: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
}

export interface TopItemStat {
  itemId?: string;
  name: string;
  quantity: number;
  revenue: number;
}

function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function getTodayAppointmentMetrics(): TodayAppointmentMetrics {
  const allApts = getAppointments();
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const todayApts = allApts.filter(a => isSameDay(new Date(a.startDateTime), now));
  const yesterdayApts = allApts.filter(a => isSameDay(new Date(a.startDateTime), yesterday));

  const totalCount = todayApts.length;
  const yesterdayCount = yesterdayApts.length;
  let percentageChangeVsYesterday = 0;
  if (yesterdayCount > 0) {
    percentageChangeVsYesterday = Math.round(((totalCount - yesterdayCount) / yesterdayCount) * 100);
  } else if (totalCount > 0) {
    percentageChangeVsYesterday = 100;
  }

  const completedCount = todayApts.filter(a => Boolean(a.linkedInvoiceId)).length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return {
    totalCount,
    percentageChangeVsYesterday,
    completionRate,
    completedCount
  };
}

export function getTodayCustomerMetrics(): TodayCustomerMetrics {
  const allInvoices = getInvoices();
  const now = new Date();
  const todayInvoices = allInvoices.filter(inv => isSameDay(new Date(inv.completedAt), now));

  const allCusts = getCustomers();
  const todayCustIds = new Set<string>();
  let retailCount = 0;

  todayInvoices.forEach(inv => {
    if (inv.isRetailCustomer || inv.customerId === 'retail_walkin') {
      retailCount++;
    } else if (inv.customerId) {
      todayCustIds.add(inv.customerId);
    }
  });

  let newCount = 0;
  let returningCount = 0;

  todayCustIds.forEach(cId => {
    const cust = allCusts.find(c => c.id === cId);
    if (cust && isSameDay(new Date(cust.createdAt), now)) {
      newCount++;
    } else {
      returningCount++;
    }
  });

  const totalVisits = todayInvoices.length;

  return {
    totalVisits,
    newCustomers: newCount,
    returningCustomers: returningCount,
    retailCustomers: retailCount
  };
}

export function getTodayRevenueMetrics(): TodayRevenueMetrics {
  const allInvoices = getInvoices();
  const now = new Date();
  const todayInvoices = allInvoices.filter(inv => isSameDay(new Date(inv.completedAt), now));

  let totalRevenue = 0;
  let totalCostPrice = 0;

  todayInvoices.forEach(inv => {
    totalRevenue += inv.totalPayable;
    inv.lines.forEach(line => {
      // Goods COGS
      if (line.itemTypeSnapshot === 'GOODS' || line.itemTypeSnapshot === 'VACCINE_PRODUCT') {
        totalCostPrice += (line.costPriceSnapshot || 0) * line.quantity;
      }
    });
  });

  // Net revenue = Total payable - Cost of Goods
  const netRevenue = Math.max(0, totalRevenue - totalCostPrice);

  return {
    totalRevenue,
    totalCostPrice,
    netRevenue,
    invoiceCount: todayInvoices.length
  };
}

/**
 * Filter invoices within a specified period
 */
export function getInvoicesInPeriod(
  period: TimeFilterPeriod,
  customStart?: string,
  customEnd?: string
): Invoice[] {
  const allInvoices = getInvoices();
  const now = new Date();

  return allInvoices.filter(inv => {
    const invDate = new Date(inv.completedAt);

    if (period === 'hour') {
      // Invoices in current hour
      return isSameDay(invDate, now) && invDate.getHours() === now.getHours();
    }
    if (period === 'day') {
      return isSameDay(invDate, now);
    }
    if (period === 'month') {
      return invDate.getFullYear() === now.getFullYear() && invDate.getMonth() === now.getMonth();
    }
    if (period === 'year') {
      return invDate.getFullYear() === now.getFullYear();
    }
    if (period === 'custom') {
      if (!customStart) return true;
      const startMs = new Date(`${customStart}T00:00:00`).getTime();
      const endMs = customEnd ? new Date(`${customEnd}T23:59:59`).getTime() : now.getTime();
      const invMs = invDate.getTime();
      return invMs >= startMs && invMs <= endMs;
    }
    return true;
  });
}

/**
 * Revenue chart data points
 */
export function getRevenueChartData(
  period: TimeFilterPeriod,
  customStart?: string,
  customEnd?: string
): { points: ChartDataPoint[]; totalRevenue: number; invoiceCount: number; netRevenue: number } {
  const invoices = getInvoicesInPeriod(period, customStart, customEnd);
  const now = new Date();
  let points: ChartDataPoint[] = [];

  let totalRevenue = 0;
  let totalCost = 0;
  invoices.forEach(inv => {
    totalRevenue += inv.totalPayable;
    inv.lines.forEach(l => {
      if (l.itemTypeSnapshot === 'GOODS' || l.itemTypeSnapshot === 'VACCINE_PRODUCT') {
        totalCost += (l.costPriceSnapshot || 0) * l.quantity;
      }
    });
  });

  if (period === 'hour' || period === 'day') {
    // Breakdown by hour slots: 08:00 to 20:00
    const buckets: Record<number, number> = {};
    for (let h = 8; h <= 20; h++) buckets[h] = 0;

    invoices.forEach(inv => {
      const h = new Date(inv.completedAt).getHours();
      if (buckets[h] !== undefined) {
        buckets[h] += inv.totalPayable;
      }
    });

    points = Object.keys(buckets).map(hStr => {
      const h = parseInt(hStr, 10);
      return {
        label: `${h}:00`,
        value: buckets[h]
      };
    });
  } else if (period === 'month') {
    // Breakdown by weeks or days (last 10 days)
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const dayBuckets: Record<number, number> = {};
    for (let d = 1; d <= daysInMonth; d += 2) dayBuckets[d] = 0;

    invoices.forEach(inv => {
      const d = new Date(inv.completedAt).getDate();
      const bucketKey = Math.floor((d - 1) / 2) * 2 + 1;
      if (dayBuckets[bucketKey] !== undefined) {
        dayBuckets[bucketKey] += inv.totalPayable;
      }
    });

    points = Object.keys(dayBuckets).map(dStr => ({
      label: `N${dStr}`,
      value: dayBuckets[parseInt(dStr, 10)]
    }));
  } else {
    // Months of the year
    const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
    const monthBuckets: number[] = new Array(12).fill(0);

    invoices.forEach(inv => {
      const m = new Date(inv.completedAt).getMonth();
      monthBuckets[m] += inv.totalPayable;
    });

    points = months.map((mName, i) => ({
      label: mName,
      value: monthBuckets[i]
    }));
  }

  return {
    points,
    totalRevenue,
    invoiceCount: invoices.length,
    netRevenue: Math.max(0, totalRevenue - totalCost)
  };
}

/**
 * Top 5 selling goods
 */
export function getTopSellingGoods(period: TimeFilterPeriod, limit = 5): TopItemStat[] {
  const invoices = getInvoicesInPeriod(period);
  const map: Record<string, TopItemStat> = {};

  invoices.forEach(inv => {
    inv.lines.forEach(line => {
      if (line.itemTypeSnapshot === 'GOODS' || line.itemTypeSnapshot === 'VACCINE_PRODUCT') {
        const key = line.itemId || line.itemNameSnapshot;
        if (!map[key]) {
          map[key] = {
            itemId: line.itemId,
            name: line.itemNameSnapshot,
            quantity: 0,
            revenue: 0
          };
        }
        map[key].quantity += line.quantity;
        map[key].revenue += line.lineTotal;
      }
    });
  });

  return Object.values(map)
    .sort((a, b) => b.quantity - a.quantity || b.revenue - a.revenue)
    .slice(0, limit);
}

/**
 * Popular services
 */
export function getPopularServices(period: TimeFilterPeriod, limit = 5): TopItemStat[] {
  const invoices = getInvoicesInPeriod(period);
  const map: Record<string, TopItemStat> = {};

  invoices.forEach(inv => {
    inv.lines.forEach(line => {
      if (line.itemTypeSnapshot === 'SERVICE' || line.itemTypeSnapshot === 'VACCINE_SERVICE') {
        const key = line.itemId || line.itemNameSnapshot;
        if (!map[key]) {
          map[key] = {
            itemId: line.itemId,
            name: line.itemNameSnapshot,
            quantity: 0,
            revenue: 0
          };
        }
        map[key].quantity += line.quantity;
        map[key].revenue += line.lineTotal;
      }
    });
  });

  return Object.values(map)
    .sort((a, b) => b.quantity - a.quantity || b.revenue - a.revenue)
    .slice(0, limit);
}
