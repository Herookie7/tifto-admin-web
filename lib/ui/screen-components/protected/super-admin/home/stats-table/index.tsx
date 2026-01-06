import {
  GET_DASHBOARD_ORDERS_BY_TYPE,
  GET_DASHBOARD_SALES_BY_TYPE,
} from '@/lib/api/graphql/queries/dashboard';
import { useConfiguration } from '@/lib/hooks/useConfiguration';
import { useQueryGQL } from '@/lib/hooks/useQueryQL';
import DashboardStatsTable from '@/lib/ui/useable-components/dashboard-stats-table';
import {
  IDashboardOrdersByTypeResponseGraphQL,
  IDashboardSalesByTypeResponseGraphQL,
  IQueryResult,
} from '@/lib/utils/interfaces';
import { IDateFilter } from '@/lib/utils/interfaces/dashboard.interface';
import sortDate from '@/lib/utils/methods/date.sorter';
import DateFilterCustomTab from '@/lib/ui/useable-components/date-filter-custom-tab';
import DashboardDateFilter from '@/lib/ui/useable-components/date-filter';
import { useTranslations } from 'next-intl';
import React, { useMemo } from 'react';

export default function StatesTable() {
  // Hooks
  const t = useTranslations();

  // Context
  const { CURRENCY_CODE } = useConfiguration();

  // State
  const [dateFilter, setDateFilter] = React.useState<IDateFilter>({
    dateKeyword: 'All',
    startDate: '',
    endDate: '',
  });

  // Query
  const { data, loading } = useQueryGQL(GET_DASHBOARD_ORDERS_BY_TYPE, {
    dateFilter: {
      starting_date: dateFilter.startDate || undefined,
      ending_date: dateFilter.endDate || undefined,
    },
  }, {
    fetchPolicy: 'network-only',
    debounceMs: 300,
  }) as IQueryResult<
    IDashboardOrdersByTypeResponseGraphQL | undefined,
    undefined
  >;

  const { data: salesData, loading: salesLoading } = useQueryGQL(
    GET_DASHBOARD_SALES_BY_TYPE,
    {
      dateFilter: {
        starting_date: dateFilter.startDate || undefined,
        ending_date: dateFilter.endDate || undefined,
      },
    },
    {
      fetchPolicy: 'network-only',
      debounceMs: 300,
    }
  ) as IQueryResult<
    IDashboardSalesByTypeResponseGraphQL | undefined,
    undefined
  >;

  // Handlers
  const handleDateTabChange = (tab: string) => {
    if (tab === 'All') {
      setDateFilter({ dateKeyword: 'All', startDate: '', endDate: '' });
      return;
    }
    if (tab === 'Custom') {
      setDateFilter({ ...dateFilter, dateKeyword: 'Custom' });
      return;
    }
    const { startDate, endDate } = sortDate(tab);
    setDateFilter({
      dateKeyword: tab,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });
  };

  // Memoize the data
  const dashboardOrdersByType = useMemo(() => {
    if (!data) return null;
    return data?.getDashboardOrdersByType;
  }, [data]);

  const dashboardSalesByType = useMemo(() => {
    if (!salesData) return null;
    return salesData?.getDashboardSalesByType;
  }, [salesData]);

  return (
    <div className="flex flex-col space-y-3 p-3">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">{t('Stats Overview')}</h2>
        <DateFilterCustomTab
          options={['All', 'Today', 'Week', 'Month', 'Custom']}
          selectedTab={dateFilter.dateKeyword ?? 'All'}
          setSelectedTab={handleDateTabChange}
        />
      </div>
      <DashboardDateFilter dateFilter={dateFilter} setDateFilter={setDateFilter} />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3">
        <DashboardStatsTable
          loading={loading}
          title={t('Orders')}
          data={dashboardOrdersByType ?? []}
          amountConfig={{ format: 'number', currency: CURRENCY_CODE ?? 'INR' }}
        />
        <DashboardStatsTable
          loading={salesLoading}
          title={t('Sales')}
          data={dashboardSalesByType ?? []}
          amountConfig={{ format: 'currency', currency: CURRENCY_CODE ?? 'INR' }}
        />
      </div>
    </div>
  );
}
