'use client';

// Core
import { Form, Formik } from 'formik';
import { useContext, useEffect, useMemo, useState } from 'react';

// Context
import { FoodsContext } from '@/lib/context/restaurant/foods.context';
import { RestaurantLayoutContext } from '@/lib/context/restaurant/layout-restaurant.context';
import { ToastContext } from '@/lib/context/global/toast.context';

// Hooks
import { useQueryGQL } from '@/lib/hooks/useQueryQL';
import { useTranslations } from 'next-intl';
import { useMutation } from '@apollo/client';

// Interface and Types
import {
  ICategory,
  ICategoryByRestaurantResponse,
  IDropdownSelectItem,
  IFoodDetailsComponentProps,
  IFoodNew,
  IQueryResult,
  ISubCategory,
  ISubCategoryByParentIdResponse,
  IVariationForm,
} from '@/lib/utils/interfaces';
import { IFoodDetailsForm } from '@/lib/utils/interfaces/forms/food.form.interface';

// Constants and Methods
import { FoodErrors, MAX_LANSDCAPE_FILE_SIZE, MAX_PRICE, MIN_PRICE } from '@/lib/utils/constants';
import { onErrorMessageMatcher } from '@/lib/utils/methods/error';

// Components
import CategoryAddForm from '../../../category/add-form';
import CustomButton from '@/lib/ui/useable-components/button';
import CustomTextField from '@/lib/ui/useable-components/input-field';
import CustomDropdownComponent from '@/lib/ui/useable-components/custom-dropdown';
import CustomTextAreaField from '@/lib/ui/useable-components/custom-text-area-field';
import CustomUploadImageComponent from '@/lib/ui/useable-components/upload/upload-image';
import CustomNumberField from '@/lib/ui/useable-components/number-input-field';
import CustomInputSwitch from '@/lib/ui/useable-components/custom-input-switch';

// API
import { GET_CATEGORY_BY_RESTAURANT_ID, CREATE_FOOD, EDIT_FOOD, GET_FOODS_BY_RESTAURANT_ID } from '@/lib/api/graphql';
import { GET_SUBCATEGORIES_BY_PARENT_ID } from '@/lib/api/graphql/queries/sub-categories';

// Schema
import * as Yup from 'yup';

// Prime React
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';

// Icons
import { faAdd } from '@fortawesome/free-solid-svg-icons';

// Components
import TextIconClickable from '@/lib/ui/useable-components/text-icon-clickable';
import InputSkeleton from '@/lib/ui/useable-components/custom-skeletons/inputfield.skeleton';

// Extended form interface with price fields
interface ISimplifiedFoodForm extends IFoodDetailsForm {
  price: number;
  discounted: number;
  isOutOfStock: boolean;
}

const initialValues: ISimplifiedFoodForm = {
  _id: null,
  title: '',
  description: '',
  image: '',
  category: null,
  subCategory: null,
  price: 0,
  discounted: 0,
  isOutOfStock: false,
};

// Simplified schema - subcategory is optional
const SimplifiedFoodSchema = Yup.object().shape({
  title: Yup.string()
    .max(35)
    .trim()
    .matches(/\S/, 'Name cannot be only spaces')
    .required('Required'),
  description: Yup.string()
    .max(200)
    .trim()
    .matches(/\S/, 'Name cannot be only spaces')
    .nullable(),
  category: Yup.mixed<IDropdownSelectItem>().required('Required'),
  subCategory: Yup.mixed<IDropdownSelectItem>().nullable().optional(),
  image: Yup.string().url('Invalid image URL').required('Required'),
  price: Yup.number()
    .min(MIN_PRICE, `Price must be at least ${MIN_PRICE}`)
    .max(MAX_PRICE, `Price must be at most ${MAX_PRICE}`)
    .required('Price is required'),
  discounted: Yup.number()
    .min(0, 'Discount cannot be negative')
    .max(MAX_PRICE, 'Discount is too high')
    .nullable(),
  isOutOfStock: Yup.boolean(),
});

export default function FoodDetails({
  stepperProps,
}: IFoodDetailsComponentProps) {
  // Hooks
  const t = useTranslations();
  const { showToast } = useContext(ToastContext);

  // Props
  const { onStepChange, order } = stepperProps ?? {
    onStepChange: () => {},
    type: '',
    order: -1,
  };

  // Context
  const { onSetFoodContextData, foodContextData, onClearFoodData } = useContext(FoodsContext);
  const { isAddSubCategoriesVisible, setIsAddSubCategoriesVisible } =
    useContext(RestaurantLayoutContext);
  const {
    restaurantLayoutContextData: { restaurantId },
  } = useContext(RestaurantLayoutContext);

  // State
  const [isAddCategoryVisible, setIsAddCategoryVisible] = useState(false);
  const [subCategories] = useState<ISubCategory[]>([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState<
    IDropdownSelectItem[]
  >([]);
  const [category, setCategory] = useState<ICategory | null>(null);
  const [categoryDropDown, setCategoryDropDown] =
    useState<IDropdownSelectItem>();
  const [foodInitialValues, setFoodInitialValues] = useState<ISimplifiedFoodForm>(
    foodContextData?.isEditing || foodContextData?.food?.data?.title
      ? {
          ...initialValues,
          ...foodContextData?.food?.data,
          price: foodContextData?.food?.variations?.[0]?.price ?? 0,
          discounted: foodContextData?.food?.variations?.[0]?.discounted ?? 0,
          isOutOfStock: foodContextData?.food?.variations?.[0]?.isOutOfStock ?? false,
        }
      : { ...initialValues }
  );

  // Queries
  const {
    data,
    loading: categoriesLoading,
    refetch: refetchCategories,
  } = useQueryGQL(
    GET_CATEGORY_BY_RESTAURANT_ID,
    { id: restaurantId ?? '' },
    {
      fetchPolicy: 'no-cache',
      enabled: !!restaurantId,
    }
  ) as IQueryResult<ICategoryByRestaurantResponse | undefined, undefined>;

  const {
    data: subCategoriesData,
    loading: subCategoriesLoading,
    refetch: refetchSubCategories,
  } = useQueryGQL(
    GET_SUBCATEGORIES_BY_PARENT_ID,
    {
      parentCategoryId: categoryDropDown?.code || '',
    },
    {
      enabled: !!categoryDropDown?.code && !!restaurantId,
      fetchPolicy: 'cache-and-network',
    }
  ) as IQueryResult<
    ISubCategoryByParentIdResponse | undefined,
    { parentCategoryId: string }
  >;

  // Mutation
  const [createFood, { loading: mutationLoading }] = useMutation(
    foodContextData?.isEditing ? EDIT_FOOD : CREATE_FOOD,
    {
      refetchQueries: [
        {
          query: GET_FOODS_BY_RESTAURANT_ID,
          variables: { id: restaurantId },
        },
      ],
      onCompleted: () => {
        showToast({
          type: 'success',
          title: `${foodContextData?.isEditing ? t('Edit') : t('New')} ${t('Food')}`,
          message: `${t('Food has been')} ${foodContextData?.isEditing ? t('edited') : t('added')} ${t('successfully')}.`,
        });
        onClearFoodData();
      },
      onError: (error) => {
        let message = '';
        try {
          message = error.graphQLErrors?.[0]?.message || error.message;
        } catch (err) {
          message = t('Something went wrong');
        }
        showToast({
          type: 'error',
          title: t('New Food'),
          message,
        });
      },
    }
  );

  // Memoized Data
  const categoriesDropdown = useMemo(
    () =>
      data?.restaurant?.categories.map((category: ICategory) => {
        return { label: category.title, code: category._id };
      }),
    [data?.restaurant?.categories]
  );

  const subCategoriesDropdown = useMemo(
    () =>
      subCategoriesData?.subCategoriesByParentId.map(
        (sub_category: ISubCategory) => {
          return { label: sub_category.title, code: sub_category._id };
        }
      ),
    [categoryDropDown?.code, subCategoriesData]
  );

  // Handlers
  const onFoodSubmitHandler = async (values: ISimplifiedFoodForm) => {
    try {
      // Validate restaurantId
      if (!restaurantId) {
        showToast({
          type: 'error',
          title: t('Error'),
          message: t('Restaurant ID is missing. Please refresh the page.'),
        });
        return;
      }

      // Validate required fields
      if (!values.category?.code) {
        showToast({
          type: 'error',
          title: t('Validation Error'),
          message: t('Please select a category'),
        });
        return;
      }

      // Create a simple variation with just price and discount
      // Backend expects addons as array of strings (IDs)
      // Note: isOutOfStock is stored on the product, not the variation
      const _variation = {
        title: values.title, // Use food title as variation title
        price: values.price,
        discounted: values.discounted || 0,
        addons: [] as string[], // Backend expects array of addon IDs (strings), empty for simplified form
      };

      // ProductInput structure matching backend schema
      // Note: addons in ProductInput is [AddonInput], but we're using empty array for simplified form
      const productInput: any = {
        title: values.title,
        description: values.description || undefined, // Use undefined instead of empty string
        image: values.image || undefined,
        price: values.price, // Required field
        discountedPrice: values.discounted > 0 ? values.discounted : undefined,
        subCategory: values.subCategory?.code || undefined,
        isActive: true,
        available: true,
        isOutOfStock: values.isOutOfStock,
        variations: [_variation],
        addons: [], // Empty array for simplified form - backend expects [AddonInput]
      };

      console.log('Creating product with:', {
        restaurantId,
        categoryId: values.category?.code,
        productInput,
      });

      if (foodContextData?.isEditing && foodContextData?.food?.data?._id) {
        // Update existing product
        const updateVariables: any = {
          id: foodContextData.food.data._id,
          productInput: productInput,
        };
        
        // Include categoryId if a category is selected
        if (values.category?.code) {
          updateVariables.categoryId = values.category.code;
        }

        await createFood({
          variables: updateVariables,
        });
      } else {
        // Create new product
        // categoryId is optional, so we can pass null or omit it
        const variables: any = {
          restaurantId: restaurantId,
          productInput: productInput,
        };
        
        // Only include categoryId if a category is selected
        if (values.category?.code) {
          variables.categoryId = values.category.code;
        }

        await createFood({
          variables: variables,
        });
      }
    } catch (err: any) {
      console.error('Error submitting food:', err);
      const errorMessage = err?.graphQLErrors?.[0]?.message || err?.message || t('Failed to save product');
      showToast({
        type: 'error',
        title: t('Error'),
        message: errorMessage,
      });
    }
  };

  useEffect(() => {
    if (categoryDropDown) {
      const selectedSubCategory: IDropdownSelectItem[] =
        subCategoriesData?.subCategoriesByParentId
          .filter((sub_ctg) => sub_ctg.parentCategoryId)
          .map((sub_ctg_: ISubCategory) => ({
            code: sub_ctg_?._id || '',
            label: sub_ctg_?.title || '',
          })) || [];
      setSelectedSubCategories(selectedSubCategory);
    }
    refetchCategories();
    if (categoryDropDown?.code) {
      refetchSubCategories({
        parentCategoryId: categoryDropDown.code,
      });
    }
  }, [
    categoryDropDown,
    setIsAddSubCategoriesVisible,
    isAddSubCategoriesVisible,
    subCategoriesData,
  ]);

  // UseEffects
  useEffect(() => {
    if (foodContextData?.isEditing) {
      const editing_category = categoriesDropdown?.find(
        (_category) =>
          _category.code === foodContextData?.food?.data.category?.code
      );
      setFoodInitialValues({
        ...JSON.parse(JSON.stringify(foodInitialValues)),
        category: editing_category,
        price: foodContextData?.food?.variations?.[0]?.price ?? 0,
        discounted: foodContextData?.food?.variations?.[0]?.discounted ?? 0,
        isOutOfStock: foodContextData?.food?.variations?.[0]?.isOutOfStock ?? false,
      });
      setCategoryDropDown(editing_category ?? ({} as IDropdownSelectItem));
    }
  }, [categoriesDropdown]);

  return (
    <div className="w-full h-full flex items-center justify-start">
      <div className="h-full w-full">
        <div className="flex flex-col gap-2">
          <div>
            <Formik
              initialValues={foodInitialValues}
              validationSchema={SimplifiedFoodSchema}
              enableReinitialize={true}
              onSubmit={async (values) => {
                await onFoodSubmitHandler(values);
              }}
              validateOnChange={false}
            >
              {({
                values,
                errors,
                handleChange,
                handleSubmit,
                isSubmitting,
                setFieldValue,
              }) => {
                return (
                  <Form onSubmit={handleSubmit}>
                    <div className="space-y-3">
                      <div>
                        <label
                          htmlFor="category"
                          className="text-sm font-[500]"
                        >
                          {t('Category')} <span className="text-red-500">*</span>
                        </label>
                        <Dropdown
                          name="category"
                          value={values.category}
                          placeholder={t('Select Category')}
                          className="md:w-20rem p-dropdown-no-box-shadow m-0 h-10 w-full border border-gray-300 p-0 align-middle text-sm focus:shadow-none focus:outline-none"
                          panelClassName="border-gray-200 border-2"
                          onChange={(e: DropdownChangeEvent) => {
                            handleChange(e);
                            setCategoryDropDown(e.value);
                            setFieldValue('subCategory', null); // Reset subcategory when category changes
                          }}
                          options={categoriesDropdown ?? []}
                          loading={categoriesLoading}
                          panelFooterTemplate={() => {
                            return (
                              <div className="flex justify-between space-x-2">
                                <TextIconClickable
                                  className="w-full h-fit rounded  text-black"
                                  icon={faAdd}
                                  iconStyles={{ color: 'black' }}
                                  title={t('Add New Category')}
                                  onClick={() => setIsAddCategoryVisible(true)}
                                />
                              </div>
                            );
                          }}
                          style={{
                            borderColor: onErrorMessageMatcher(
                              'category',
                              errors?.category,
                              FoodErrors
                            )
                              ? 'red'
                              : '',
                          }}
                        />
                      </div>

                      {/* Subcategory - Optional and less prominent */}
                      {categoryDropDown && (
                        <div>
                          {!subCategoriesLoading ? (
                            <CustomDropdownComponent
                              name="subCategory"
                              placeholder={t('Select Sub-Category (Optional)')}
                              showLabel={true}
                              extraFooterButton={{
                                onChange: () => {
                                  const parentCategoryId = values?.category?.code || categoryDropDown?.code;
                                  if (parentCategoryId) {
                                    setIsAddSubCategoriesVisible((prev) => ({
                                      bool: !prev.bool,
                                      parentCategoryId: parentCategoryId,
                                    }));
                                    refetchSubCategories({
                                      parentCategoryId: parentCategoryId,
                                    });
                                  }
                                },
                                title: t('Add Sub-Category'),
                              }}
                              selectedItem={values.subCategory}
                              setSelectedItem={setFieldValue}
                              options={
                                subCategoriesDropdown ??
                                selectedSubCategories ??
                                []
                              }
                              isLoading={subCategoriesLoading}
                              style={{
                                borderColor: onErrorMessageMatcher(
                                  'subCategory',
                                  errors?.subCategory,
                                  FoodErrors
                                )
                                  ? 'red'
                                  : '',
                              }}
                            />
                          ) : (
                            <InputSkeleton />
                          )}
                        </div>
                      )}

                      <div>
                        <CustomTextField
                          type="text"
                          name="title"
                          placeholder={t('Product Name')}
                          maxLength={35}
                          value={values.title}
                          onChange={handleChange}
                          showLabel={true}
                          style={{
                            borderColor: onErrorMessageMatcher(
                              'title',
                              errors?.title,
                              FoodErrors
                            )
                              ? 'red'
                              : '',
                          }}
                        />
                      </div>
                      <div>
                        <CustomTextAreaField
                          name="description"
                          label={t('Description')}
                          placeholder={t('Description (Optional)')}
                          value={values.description}
                          onChange={handleChange}
                          showLabel={true}
                          className={''}
                          style={{
                            borderColor: onErrorMessageMatcher(
                              'description',
                              errors.description,
                              FoodErrors
                            )
                              ? 'red'
                              : '',
                          }}
                        />
                      </div>

                      <div>
                        <CustomUploadImageComponent
                          key="image"
                          name="image"
                          title={t('Upload Image')}
                          fileTypes={['image/jpg', 'image/webp', 'image/jpeg']}
                          maxFileHeight={841}
                          maxFileWidth={1980}
                          maxFileSize={MAX_LANSDCAPE_FILE_SIZE}
                          orientation="LANDSCAPE"
                          onSetImageUrl={setFieldValue}
                          existingImageUrl={values.image}
                          showExistingImage={
                            foodContextData?.isEditing ? true : false
                          }
                          style={{
                            borderColor: onErrorMessageMatcher(
                              'image',
                              errors?.image as string,
                              FoodErrors
                            )
                              ? 'red'
                              : '',
                          }}
                        />
                      </div>

                      {/* Price Fields */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <CustomNumberField
                            name="price"
                            min={MIN_PRICE}
                            max={MAX_PRICE}
                            minFractionDigits={0}
                            maxFractionDigits={2}
                            placeholder={t('Price')}
                            showLabel={true}
                            value={values.price}
                            onChangeFieldValue={setFieldValue}
                            style={{
                              borderColor: errors?.price ? 'red' : '',
                            }}
                          />
                        </div>
                        <div>
                          <CustomNumberField
                            name="discounted"
                            min={0}
                            placeholder={t('Discount (Optional)')}
                            showLabel={true}
                            value={values.discounted}
                            onChangeFieldValue={setFieldValue}
                            style={{
                              borderColor: errors?.discounted ? 'red' : '',
                            }}
                          />
                        </div>
                      </div>

                      {values.discounted > 0 && (
                        <div className="text-xs text-gray-600 p-2 bg-gray-50 rounded">
                          <p>
                            {t('Original Price')}: <span className="line-through">{values.price + values.discounted}</span>
                          </p>
                          <p>
                            {t('Discounted Price')}: <span className="font-semibold">{values.price}</span>
                          </p>
                        </div>
                      )}

                      {/* Out of Stock Toggle */}
                      <div className="flex justify-end">
                        <CustomInputSwitch
                          label={t('Out of Stock')}
                          loading={false}
                          isActive={values.isOutOfStock}
                          onChange={() => {
                            setFieldValue('isOutOfStock', !values.isOutOfStock);
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end mt-4">
                      <CustomButton
                        className="w-fit h-10 bg-black text-white border-gray-300 px-8"
                        label={foodContextData?.isEditing ? t('Update') : t('Add Product')}
                        type="submit"
                        loading={isSubmitting || mutationLoading}
                      />
                    </div>
                  </Form>
                );
              }}
            </Formik>
          </div>
        </div>
      </div>

      <CategoryAddForm
        category={category}
        onHide={() => {
          setIsAddCategoryVisible(false);
          setCategory(null);
        }}
        isAddCategoryVisible={isAddCategoryVisible}
        subCategories={subCategories}
        onCategoryAdded={() => {
          refetchCategories();
        }}
      />
    </div>
  );
}
