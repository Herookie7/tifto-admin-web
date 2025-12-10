// Core
import { useEffect, useMemo, useState, useContext } from 'react';

// Prime React
import { Chart } from 'primereact/chart';
import { useQueryGQL } from '@/lib/hooks/useQueryQL';
import { GET_DASHBOARD_RESTAURANT_SALES_ORDER_COUNT_DETAILS_BY_YEAR } from '@/lib/api/graphql';
import {
  IDashboardRestaurantSalesOrderCountDetailsByYearResponseGraphQL,
  IQueryResult,
} from '@/lib/utils/interfaces';
import DashboardUsersByYearStatsSkeleton from '@/lib/ui/useable-components/custom-skeletons/dasboard.user.year.stats.skeleton';
import { RestaurantLayoutContext } from '@/lib/context/restaurant/layout-restaurant.context';
import { useTranslations } from 'next-intl';

// Dummy

export default function GrowthOverView() {
  // Hooks
  const t = useTranslations();

  // Context
  const {
    restaurantLayoutContextData: { restaurantId },
  } = useContext(RestaurantLayoutContext);

  // States
  const [chartData, setChartData] = useState({});
  const [chartOptions, setChartOptions] = useState({});

  // Query
  const { data, loading, error } = useQueryGQL(
    GET_DASHBOARD_RESTAURANT_SALES_ORDER_COUNT_DETAILS_BY_YEAR,
    {
      restaurant: restaurantId,
      year: new Date().getFullYear(),
    },
    {
      fetchPolicy: 'network-only',
      enabled: !!restaurantId,
      debounceMs: 300,
      onError: (err) => {
        // Silently handle missing query errors or type mismatches
        if (err.message?.includes('Cannot query field') || 
            err.message?.includes('cannot represent non-integer value') ||
            err.message?.includes('Int cannot represent')) {
          console.warn('Dashboard query error:', err.message);
        }
      },
    }
  ) as IQueryResult<
    IDashboardRestaurantSalesOrderCountDetailsByYearResponseGraphQL | undefined,
    undefined
  >;

  const dashboardSalesOrderCountDetailsByYear = useMemo(() => {
    if (!data || error) return null;
    const salesAmount = data?.getRestaurantDashboardSalesOrderCountDetailsByYear?.salesAmount;
    const ordersCount = data?.getRestaurantDashboardSalesOrderCountDetailsByYear?.ordersCount;
    
    // Backend returns single values (Float and Int), but chart needs arrays for monthly data
    // For now, return empty arrays if data is not in expected format
    // TODO: Backend should return monthly breakdown arrays, not single totals
    if (Array.isArray(salesAmount) && Array.isArray(ordersCount)) {
      return {
        salesAmount: salesAmount.length === 12 ? salesAmount : [],
        ordersCount: ordersCount.length === 12 ? ordersCount : [],
      };
    }
    
    // If single values, return empty arrays (chart will show empty)
    // This prevents the GraphQL type error
    return {
      salesAmount: [],
      ordersCount: [],
    };
  }, [data, error]);

  // Handlers
  const onChartDataChange = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue(
      '--text-color-secondary'
    );
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');
    const data = {
      labels: [
        t('January'),
        t('February'),
        t('March'),
        t('April'),
        t('May'),
        t('June'),
        t('July'),
        t('August'),
        t('September'),
        t('October'),
        t('November'),
        t('December'),
      ],
      datasets: [
        {
          label: t('Sales Amount'),
          data: dashboardSalesOrderCountDetailsByYear?.salesAmount ?? [],
          fill: false,
          borderColor: documentStyle.getPropertyValue('--pink-500'),
          backgroundColor: documentStyle.getPropertyValue('--pink-100'),
          tension: 0.5,
        },
        {
          label: t('Orders Count'),
          data: dashboardSalesOrderCountDetailsByYear?.ordersCount ?? [],
          fill: false,
          borderColor: documentStyle.getPropertyValue('--blue-500'),
          backgroundColor: documentStyle.getPropertyValue('--blue-100'),
          tension: 0.5,
        },
      ],
    };
    const options = {
      maintainAspectRatio: false,
      aspectRatio: 0.6,

      plugins: {
        legend: {
          marginBottom: '20px',
          labels: {
            usePointStyle: true,
            pointStyle: 'circle',
            backgroundColor: textColor,
            color: textColor,
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
          },
        },
        y: {
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
          },
        },
      },
    };

    setChartData(data);
    setChartOptions(options);
  };
  // Use Effect
  useEffect(() => {
    onChartDataChange();
  }, [dashboardSalesOrderCountDetailsByYear]);

  return (
    <div className={`w-full p-3`}>
      <h2 className="text-lg font-semibold">{t('Growth Overview')}</h2>
      <p className="text-gray-500">
        {t('Tracking Store Growth Over the Year')}
      </p>
      <div className="mt-4">
        {loading ? (
          <DashboardUsersByYearStatsSkeleton />
        ) : (
          <Chart type="line" data={chartData} options={chartOptions} />
        )}
      </div>
    </div>
  );
}
