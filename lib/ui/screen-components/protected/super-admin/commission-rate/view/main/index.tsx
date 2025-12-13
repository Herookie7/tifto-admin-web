// GraphQL API imports
import { GET_RESTAURANTS, updateCommission } from '@/lib/api/graphql';

// Context imports
import { ToastContext } from '@/lib/context/global/toast.context';

// Custom hooks
import { useQueryGQL } from '@/lib/hooks/useQueryQL';
// UI components
import Table from '@/lib/ui/useable-components/table';

// Utility functions
import { generateDummyCommissionRates } from '@/lib/utils/dummy';

// Type definitions
import { IQueryResult, IRestaurantResponse } from '@/lib/utils/interfaces';

// Apollo Client hooks
import { useMutation } from '@apollo/client';

// React hooks
import { useContext, useEffect, useState } from 'react';

// Table column definitions
import { COMMISSION_RATE_ACTIONS } from '@/lib/utils/constants';

import CommissionRateHeader from '../header/table-header';
import { useTranslations } from 'next-intl';
import { COMMISSION_RATE_COLUMNS } from '@/lib/ui/useable-components/table/columns/comission-rate-columns';

interface RestaurantsData {
  restaurants: IRestaurantResponse[];
}

export default function CommissionRateMain() {
  //Hooks
  const t = useTranslations();

  // States
  const [restaurants, setRestaurants] = useState<IRestaurantResponse[]>([]);
  const [editingRestaurantIds, setEditingRestaurantIds] = useState<Set<string>>(
    new Set()
  );
  const [selectedRestaurants, setSelectedRestaurants] = useState<
    IRestaurantResponse[]
  >([]);
  const [loadingRestaurant, setLoadingRestaurant] = useState<string | null>(
    null
  );
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Context
  const { showToast } = useContext(ToastContext);

  // Query
  const { data, error, refetch, loading } = useQueryGQL(
    GET_RESTAURANTS,
    {}, // Empty variables object (required parameter)
    {
      fetchPolicy: 'network-only',
      errorPolicy: 'all', // Return partial data even if there are errors
      onError: (error) => {
        console.error('Error fetching restaurants for commission rates:', error);
      },
    }
  ) as IQueryResult<RestaurantsData | undefined, undefined>;

  // Mutation
  const [updateCommissionMutation] = useMutation(updateCommission, {
    onError: (error) => {
      console.error('Error updating commission:', error);
    },
  });

  // Handlers
  const handleSave = async (restaurantId: string) => {
    const restaurant = restaurants.find((r) => r._id === restaurantId);
    if (!restaurant || restaurant.commissionRate === undefined || restaurant.commissionRate === null) {
      return showToast({
        type: 'error',
        title: t('Commission Updated'),
        message: `${t('Commission')} ${t('Update')} ${t('failed')}`,
      });
    }
    if (restaurant) {
      setLoadingRestaurant(restaurantId);
      const commissionType = restaurant.commissionType || 'percentage';
      
      // Validate percentage commission rate
      if (commissionType === 'percentage' && restaurant.commissionRate > 100) {
        setLoadingRestaurant(null);
        return showToast({
          type: 'error',
          title: t('Commission Updated'),
          message: t(
            'As commission rate is a %age value so it cannot exceed a max value of 100'
          ),
        });
      }

      // Validate fixed commission rate
      if (commissionType === 'fixed' && restaurant.commissionRate < 0) {
        setLoadingRestaurant(null);
        return showToast({
          type: 'error',
          title: t('Commission Updated'),
          message: t('Fixed commission rate cannot be negative'),
        });
      }

      try {
        await updateCommissionMutation({
          variables: {
            id: restaurantId,
            commissionType: commissionType,
            commissionRate: parseFloat(String(restaurant.commissionRate)),
          },
        });
        showToast({
          type: 'success',
          title: t('Commission Updated'),
          message: `${t('Commission rate updated for')} ${restaurant.name}`,
          duration: 2000,
        });
        setEditingRestaurantIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(restaurantId);
          return newSet;
        });
        refetch();
      } catch (error) {
        showToast({
          type: 'error',
          title: t('Error'),
          message: `${t('Error updating commission rate for')} ${restaurant.name}`,
          duration: 2000,
        });
      } finally {
        setLoadingRestaurant(null);
      }
    }
  };

  const handleCommissionRateChange = (restaurantId: string, value: number) => {
    setRestaurants((prevRestaurants) =>
      prevRestaurants.map((restaurant) =>
        restaurant._id === restaurantId
          ? { ...restaurant, commissionRate: value }
          : restaurant
      )
    );
    setEditingRestaurantIds((prev) => {
      const newSet = new Set(prev);
      newSet.add(restaurantId);
      return newSet;
    });
  };

  const handleCommissionTypeChange = (restaurantId: string, type: string) => {
    setRestaurants((prevRestaurants) =>
      prevRestaurants.map((restaurant) =>
        restaurant._id === restaurantId
          ? { ...restaurant, commissionType: type }
          : restaurant
      )
    );
    setEditingRestaurantIds((prev) => {
      const newSet = new Set(prev);
      newSet.add(restaurantId);
      return newSet;
    });
  };

  const getFilteredRestaurants = () => {
    return restaurants.filter((restaurant) => {
      const nameMatches = restaurant.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      // Always show restaurants that are currently being edited
      if (editingRestaurantIds.has(restaurant._id)) {
        return true;
      }

      // Apply name filter
      if (!nameMatches) {
        return false;
      }

      // If no commission rate filters are applied, show all name matches
      if (selectedActions.length === 0) {
        return true;
      }

      // Apply commission rate filters
      return selectedActions.some((action) => {
        switch (action) {
          case COMMISSION_RATE_ACTIONS.MORE_THAN_5:
            return restaurant.commissionRate > 5;
          case COMMISSION_RATE_ACTIONS.MORE_THAN_10:
            return restaurant.commissionRate > 10;
          case COMMISSION_RATE_ACTIONS.MORE_THAN_20:
            return restaurant.commissionRate > 20;
          default:
            return false;
        }
      });
    });
  };

  // Use Effects
  useEffect(() => {
    if (data?.restaurants) {
      let updatedRestaurants = data.restaurants.map((v) => {
        let obj = { ...v };
        // Set default commissionType to 'percentage' if not present (backward compatibility)
        if (!obj.commissionType) {
          obj.commissionType = 'percentage';
        }
        console.log('Restaurant commission rate:', v.commissionRate);
        // if (v.commissionRate === null) obj['commissionRate'] = 25;

        return obj;
      });
      setRestaurants(updatedRestaurants);
    } else if (error) {
      console.error('Error fetching restaurants:', error);
      showToast({
        type: 'error',
        title: t('Error Fetching Restaurants'),
        message: error.message || t(
          'An error occurred while fetching restaurants. Please try again later.'
        ),
        duration: 2000,
      });
    }
  }, [data, error, showToast, t]);

  return (
    <div className="p-3">
      <Table
        data={
          loading ? generateDummyCommissionRates() : getFilteredRestaurants()
        }
        setSelectedData={setSelectedRestaurants}
        selectedData={selectedRestaurants}
        columns={COMMISSION_RATE_COLUMNS({
          handleSave,
          handleCommissionRateChange,
          handleCommissionTypeChange,
          loadingRestaurant,
        })}
        loading={loading}
        header={
          <CommissionRateHeader
            selectedActions={selectedActions}
            setSelectedActions={setSelectedActions}
            onSearch={setSearchTerm}
          />
        }
      />
    </div>
  );
}
