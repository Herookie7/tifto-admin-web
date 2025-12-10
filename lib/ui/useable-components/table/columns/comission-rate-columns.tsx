// Core
import React from 'react';
import { Form, Formik } from 'formik';

// Custom Components
import CustomCommissionTextField from '../../custom-commission-input';
import CustomButton from '../../button';

// Interfaces and Types
import {
  ICommissionColumnProps,
  IRestaurantResponse,
} from '@/lib/utils/interfaces';
import { useTranslations } from 'next-intl';

export const COMMISSION_RATE_COLUMNS = ({
  handleSave,
  handleCommissionRateChange,
  handleCommissionTypeChange,
  loadingRestaurant,
}: ICommissionColumnProps & { loadingRestaurant: string | null }) => {
  // Hooks
  const t = useTranslations();
  return [
    {
      headerName: t('Name'),
      propertyName: 'name',
      body: (restaurant: IRestaurantResponse) => (
        <span style={{ fontWeight: 'bold' }}>{restaurant.name}</span>
      ),
    },
    {
      headerName: t('Commission Type'),
      propertyName: 'commissionType',
      body: (restaurant: IRestaurantResponse) => {
        const currentType = restaurant.commissionType || 'percentage';
        return (
          <Formik
            initialValues={{
              [`commissionType-${restaurant._id}`]: currentType,
            }}
            onSubmit={() => {
              handleSave(restaurant._id);
            }}
          >
            {({ values, handleChange, handleSubmit }) => (
              <Form onSubmit={handleSubmit}>
                <div className="flex gap-2">
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      name={`commissionType-${restaurant._id}`}
                      value="percentage"
                      checked={values[`commissionType-${restaurant._id}`] === 'percentage'}
                      onChange={(e) => {
                        handleChange(e);
                        if (handleCommissionTypeChange) {
                          handleCommissionTypeChange(restaurant._id, e.target.value);
                        }
                      }}
                      className="mr-1"
                    />
                    <span className="text-sm">{t('Percentage')}</span>
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      name={`commissionType-${restaurant._id}`}
                      value="fixed"
                      checked={values[`commissionType-${restaurant._id}`] === 'fixed'}
                      onChange={(e) => {
                        handleChange(e);
                        if (handleCommissionTypeChange) {
                          handleCommissionTypeChange(restaurant._id, e.target.value);
                        }
                      }}
                      className="mr-1"
                    />
                    <span className="text-sm">{t('Fixed')}</span>
                  </label>
                </div>
              </Form>
            )}
          </Formik>
        );
      },
    },
    {
      headerName: t('Set Commission Rate'),
      propertyName: 'commissionRate',
      body: (restaurant: IRestaurantResponse) => {
        const currentType = restaurant.commissionType || 'percentage';
        const isPercentage = currentType === 'percentage';
        return (
          <Formik
            initialValues={{
              [`commissionRate-${restaurant._id}`]: restaurant.commissionRate || 0,
            }}
            onSubmit={() => {
              handleSave(restaurant._id);
            }}
          >
            {({ values, handleChange, handleSubmit }) => (
              <Form onSubmit={handleSubmit}>
                <div className="flex items-center gap-2">
                  <CustomCommissionTextField
                    type="number"
                    name={`commissionRate-${restaurant._id}`}
                    value={String(values[`commissionRate-${restaurant._id}`] || 0)}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      handleChange(e);
                      handleCommissionRateChange(
                        restaurant._id,
                        parseFloat(e.target.value) || 0
                      );
                    }}
                    min={0}
                    max={isPercentage ? 100 : undefined}
                    showLabel={false}
                    loading={false}
                    commissionType={currentType}
                  />
                  <span className="text-sm text-gray-600">
                    {isPercentage ? '%' : 'Rs.'}
                  </span>
                </div>
              </Form>
            )}
          </Formik>
        );
      },
    },
    {
      headerName: t('Actions'),
      propertyName: 'action',
      body: (restaurant: IRestaurantResponse) => (
        <Formik initialValues={{}} onSubmit={() => handleSave(restaurant._id)}>
          {({ handleSubmit, isSubmitting }) => (
            <Form onSubmit={handleSubmit}>
              <CustomButton
                type="submit"
                className="mt-2 flex h-10 w-24 rounded-md border border-gray-500 bg-white px-4 text-black transition-colors duration-200 hover:bg-black hover:text-white"
                label={t('Save')}
                rounded={false}
                loading={loadingRestaurant === restaurant._id || isSubmitting}
                disabled={loadingRestaurant === restaurant._id || isSubmitting}
              />
            </Form>
          )}
        </Formik>
      ),
    },
  ];
};
