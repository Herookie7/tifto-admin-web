'use client';

// Component
import GrowthOverView from '@/lib/ui/screen-components/protected/restaurant/dashboard/growth-overview';
import OrderStats from '@/lib/ui/screen-components/protected/restaurant/dashboard/order-stats';
import RestaurantStatesTable from '@/lib/ui/screen-components/protected/restaurant/dashboard/restaurant-stats-table';
import DashboardSubHeader from '@/lib/ui/screen-components/protected/restaurant/dashboard/sub-header';
import DashboardDateFilter from '@/lib/ui/useable-components/date-filter';

import { IDateFilter } from '@/lib/utils/interfaces';
import { useState } from 'react';

export default function AdminRestaurantDashboard() {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
  const currentDay = String(currentDate.getDate()).padStart(2, '0');

  const [dateFilter, setDateFilter] = useState<IDateFilter>({
    dateKeyword: 'All',
    startDate: `${currentYear}-01-01`, // Current year, January 1st
    endDate: `${currentYear}-${currentMonth}-${currentDay}`, // Current date
  });

  const handleDateFilter = (dateFilter: IDateFilter) => {
    console.log("dateFilter.....", dateFilter);
    setDateFilter({
      ...dateFilter,
      dateKeyword: dateFilter.dateKeyword ?? '',
    });
  };

  return (
    <div className="screen-container">
      <DashboardSubHeader
        dateFilter={dateFilter}
        handleDateFilter={handleDateFilter}
      />
      <DashboardDateFilter
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
      />

      <OrderStats dateFilter={dateFilter} />
      <GrowthOverView />
      <RestaurantStatesTable dateFilter={dateFilter} />
    </div>
  );
}
