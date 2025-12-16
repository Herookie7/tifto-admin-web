'use client';

// Core
import { useContext, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

// PrimeReact
import { FilterMatchMode } from 'primereact/api';

// Context
import { ToastContext } from '@/lib/context/global/toast.context';
import { MenuItemsContext } from '@/lib/context/super-admin/menu-items.context';

// Services
import { productsService } from '@/lib/services';

// Custom Hooks
import useDebounce from '@/lib/hooks/useDebounce';

// Custom Components
import MenuItemsTableHeader from '../header/table-header';
import Table from '@/lib/ui/useable-components/table';
import CustomDialog from '@/lib/ui/useable-components/delete-dialog';
import ActionMenu from '@/lib/ui/useable-components/action-menu';
import { Skeleton } from 'primereact/skeleton';

// Constants and Interfaces
import { IActionMenuItem } from '@/lib/utils/interfaces';

interface Product {
  _id?: string;
  title: string;
  description?: string;
  price: number;
  discountedPrice?: number;
  image?: string;
  restaurant: string;
  categories?: string[];
  available?: boolean;
  isActive?: boolean;
  [key: string]: any;
}

export default function MenuItemsMain() {
  // Hooks
  const t = useTranslations();
  const params = useParams();
  const restaurantId = params?.id as string;

  // Context
  const { showToast } = useContext(ToastContext);
  const { onSetEditingMenuItem } = useContext(MenuItemsContext);

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string>('');
  const [deleting, setDeleting] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(50); // Increased default to show more products
  const [totalRecords, setTotalRecords] = useState(0);

  // Debounce search
  const debouncedSearchTerm = useDebounce(globalFilterValue, 500);

  const filters = {
    global: { value: globalFilterValue, matchMode: FilterMatchMode.CONTAINS },
  };

  // Fetch products
  useEffect(() => {
    if (restaurantId) {
      fetchProducts();
    }
  }, [restaurantId, debouncedSearchTerm, currentPage, rowsPerPage]);

  // Listen for refresh events
  useEffect(() => {
    const handleRefresh = () => {
      fetchProducts();
    };
    window.addEventListener('menu-items-refresh', handleRefresh);
    return () => {
      window.removeEventListener('menu-items-refresh', handleRefresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsService.getProducts({
        restaurant: restaurantId,
        search: debouncedSearchTerm || undefined,
        page: currentPage,
        limit: rowsPerPage,
      });
      
      console.log('Fetched products response:', {
        total: response.total,
        page: response.page,
        limit: response.limit,
        resultsCount: response.results?.length || 0,
        products: response.results,
      });
      
      setProducts(response.results || []);
      setTotalRecords(response.total || 0);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      showToast({
        type: 'error',
        title: t('Error'),
        message: error.message || t('Failed to fetch menu items'),
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      setDeleting(true);
      await productsService.deleteProduct(id);
      showToast({
        type: 'success',
        title: t('Success'),
        message: t('Menu item deleted successfully'),
      });
      fetchProducts();
      setDeleteId('');
    } catch (error: any) {
      showToast({
        type: 'error',
        title: t('Error'),
        message: error.message || t('Failed to delete menu item'),
      });
    } finally {
      setDeleting(false);
    }
  };

  // Handle toggle availability
  const handleToggleAvailability = async (product: Product) => {
    if (!product._id) {
      showToast({
        type: 'error',
        title: t('Error'),
        message: t('Product ID is missing'),
      });
      return;
    }
    try {
      await productsService.toggleProductAvailability(
        product._id,
        !product.available
      );
      showToast({
        type: 'success',
        title: t('Success'),
        message: t('Menu item availability updated'),
      });
      fetchProducts();
    } catch (error: any) {
      showToast({
        type: 'error',
        title: t('Error'),
        message: error.message || t('Failed to update availability'),
      });
    }
  };

  // Pagination handlers
  const handlePageChange = (page: number, rows: number) => {
    setCurrentPage(page);
    setRowsPerPage(rows);
  };

  // Menu items actions
  const menuItems: IActionMenuItem<Product>[] = [
    {
      label: t('Edit'),
      command: (data?: Product) => {
        if (data) {
          onSetEditingMenuItem(data);
        }
      },
    },
    {
      label: t('Delete'),
      command: (data?: Product) => {
        if (data && data._id) {
          setDeleteId(data._id);
        }
      },
    },
    {
      label: (data?: Product) =>
        data?.available ? t('Mark Unavailable') : t('Mark Available'),
      command: (data?: Product) => {
        if (data) {
          handleToggleAvailability(data);
        }
      },
    },
  ];

  // Table columns
  const columns = [
    { headerName: t('Title'), propertyName: 'title' },
    {
      headerName: t('Description'),
      propertyName: 'description',
      body: (item: Product) => (
        <div className="max-w-xs truncate">{item.description || '-'}</div>
      ),
    },
    {
      headerName: t('Price'),
      propertyName: 'price',
      body: (item: Product) => (
        <div>
          {item.discountedPrice ? (
            <div>
              <span className="line-through text-gray-400">
                ${item.price}
              </span>
              <span className="ml-2 text-green-600 font-bold">
                ${item.discountedPrice}
              </span>
            </div>
          ) : (
            <span>${item.price}</span>
          )}
        </div>
      ),
    },
    {
      headerName: t('Category'),
      propertyName: 'categories',
      body: (item: Product) => (
        <div>
          {item.categories && item.categories.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {item.categories.slice(0, 2).map((cat, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                >
                  {cat}
                </span>
              ))}
              {item.categories.length > 2 && (
                <span className="text-xs text-gray-500">
                  +{item.categories.length - 2}
                </span>
              )}
            </div>
          ) : (
            '-'
          )}
        </div>
      ),
    },
    {
      headerName: t('Image'),
      propertyName: 'image',
      body: (item: Product) =>
        item.image ? (
          <img
            src={item.image}
            alt={item.title}
            className="w-10 h-10 object-cover rounded"
          />
        ) : (
          <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">
            {t('No Image')}
          </div>
        ),
    },
    {
      headerName: t('Available'),
      propertyName: 'available',
      body: (item: Product) => (
        <span
          className={`px-2 py-1 rounded text-xs ${
            item.available
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {item.available ? t('Yes') : t('No')}
        </span>
      ),
    },
    {
      headerName: t('Actions'),
      propertyName: 'actions',
      body: (item: Product) => {
        return <ActionMenu items={menuItems} data={item} />;
      },
    },
  ];

  if (loading && products.length === 0) {
    return (
      <div className="p-3">
        <Skeleton height="3rem" className="mb-2" />
        <Skeleton height="20rem" />
      </div>
    );
  }

  return (
    <div className="p-3">
      <Table
        header={
          <MenuItemsTableHeader
            globalFilterValue={globalFilterValue}
            onGlobalFilterChange={(e) => setGlobalFilterValue(e.target.value)}
          />
        }
        data={products}
        filters={filters}
        setSelectedData={setSelectedProducts}
        selectedData={selectedProducts}
        columns={columns}
        loading={loading}
        rowsPerPage={rowsPerPage}
        totalRecords={totalRecords}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />

      <CustomDialog
        loading={deleting}
        visible={!!deleteId}
        onHide={() => setDeleteId('')}
        onConfirm={() => handleDelete(deleteId)}
        message={t('Are you sure you want to delete this menu item?')}
      />
    </div>
  );
}

