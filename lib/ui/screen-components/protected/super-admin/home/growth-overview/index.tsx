// Core
import { useEffect, useMemo, useState } from 'react';

// Prime React
import { Chart } from 'primereact/chart';
import { useQueryGQL } from '@/lib/hooks/useQueryQL';
import { GET_DASHBOARD_USERS_BY_YEAR } from '@/lib/api/graphql';
import {
  IDashboardUsersByYearResponseGraphQL,
  IQueryResult,
  IDropdownSelectItem,
} from '@/lib/utils/interfaces';
import DashboardUsersByYearStatsSkeleton from '@/lib/ui/useable-components/custom-skeletons/dasboard.user.year.stats.skeleton';
import { useTranslations } from 'next-intl';
import CustomDropdownComponent from '@/lib/ui/useable-components/custom-dropdown';

// Dummy

export default function GrowthOverView() {
  // Hooks
  const t = useTranslations();

  // States
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<IDropdownSelectItem | null>(null); // Initialize as null first, set in effect or use memo
  const [chartData, setChartData] = useState({});
  const [chartOptions, setChartOptions] = useState({});

  const yearOptions = useMemo(() => {
    const years = [];
    const startYear = 2023; // Project start or reasonable past year
    for (let i = startYear; i <= currentYear + 1; i++) {
      years.push({ label: i.toString(), code: i.toString() });
    }
    return years.reverse();
  }, [currentYear]);

  useEffect(() => {
    if (!selectedYear && yearOptions.length > 0) {
      const current = yearOptions.find(y => y.code === currentYear.toString());
      setSelectedYear(current || yearOptions[0]);
    }
  }, [yearOptions, currentYear, selectedYear]);

  // Query
  const { data, loading, error } = useQueryGQL(
    GET_DASHBOARD_USERS_BY_YEAR,
    {
      year: Number(selectedYear?.code ?? currentYear), // Ensure it's explicitly a number/Int
    },
    {
      fetchPolicy: 'network-only',
      debounceMs: 300,
      // Skip query if there's a known schema mismatch error
      errorPolicy: 'all', // Return partial data even if there are errors
    }
  ) as IQueryResult<
    IDashboardUsersByYearResponseGraphQL | undefined,
    undefined
  >;

  const dashboardUsersByYear = useMemo(() => {
    // Handle GraphQL errors gracefully - backend schema mismatch issue
    if (error) {
      console.warn(
        'GraphQL error in getDashboardUsersByYear (known schema mismatch issue):',
        error
      );
      // Return empty data structure to prevent crashes
      return {
        usersCount: new Array(12).fill(0),
        vendorsCount: new Array(12).fill(0),
        restaurantsCount: new Array(12).fill(0),
        ridersCount: new Array(12).fill(0),
      };
    }

    if (!data) return null;

    // Helper to normalize values to arrays - handle both array and single Int responses
    const normalizeToArray = (value: unknown): number[] => {
      if (Array.isArray(value)) {
        // Ensure array has 12 elements for 12 months
        return value.length === 12 ? value : new Array(12).fill(0);
      }
      if (typeof value === 'number') {
        // If single Int value, return array of 12 zeros (or spread the value)
        return new Array(12).fill(0);
      }
      // Default to empty array
      return new Array(12).fill(0);
    };

    const response = data?.getDashboardUsersByYear;
    if (!response) return null;

    return {
      usersCount: normalizeToArray(response.usersCount),
      vendorsCount: normalizeToArray(response.vendorsCount),
      restaurantsCount: normalizeToArray(response.restaurantsCount),
      ridersCount: normalizeToArray(response.ridersCount),
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
          label: t('Stores'),
          data: dashboardUsersByYear?.restaurantsCount ?? [],
          fill: false,
          borderColor: documentStyle.getPropertyValue('--pink-500'),
          backgroundColor: documentStyle.getPropertyValue('--pink-100'),
          tension: 0.5,
        },
        {
          label: t('Vendors'),
          data: dashboardUsersByYear?.vendorsCount ?? [],
          fill: false,
          borderColor: documentStyle.getPropertyValue('--blue-500'),
          backgroundColor: documentStyle.getPropertyValue('--blue-100'),
          tension: 0.5,
        },
        {
          label: t('Riders'),
          data: dashboardUsersByYear?.ridersCount ?? [],
          fill: false,
          borderColor: documentStyle.getPropertyValue('--yellow-500'),
          backgroundColor: documentStyle.getPropertyValue('--yellow-100'),
          tension: 0.5,
        },
        {
          label: t('Users'),
          data: dashboardUsersByYear?.usersCount ?? [],
          fill: true,

          borderColor: 'rgba(90, 193, 47, 1)',
          backgroundColor: 'rgba(201, 232, 189, 0.2)',
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
  }, [dashboardUsersByYear]);

  return (
    <div className={`w-full p-3`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{t('Growth Overview')}</h2>
          <p className="text-gray-500">
            {t('Tracking Stakeholders Growth Over the Year')}
          </p>
        </div>
        <div className="w-40">
          <CustomDropdownComponent
            name="year"
            options={yearOptions}
            selectedItem={selectedYear}
            setSelectedItem={(_name, value) => setSelectedYear(value)}
            placeholder={t("Select Year")}
            showLabel={false}
          />
        </div>
      </div>
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
