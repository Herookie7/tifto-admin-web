import React from 'react';
import { DataView } from 'primereact/dataview';
import ProfileCard from '../Icon-Card';
import {
  ICustomDataViewProps,
  IReview,
} from '@/lib/utils/interfaces/ratings.interface';

const CustomDataView: React.FC<ICustomDataViewProps> = ({
  products,
  header,
}) => {
  const itemTemplate = (review: IReview) => {
    if (!review || !review.order) {
      return null;
    }
    
    // Format date - handle both timestamp numbers and date strings
    const formatDate = (dateValue: string | number | Date | null | undefined): string => {
      if (!dateValue) return 'N/A';
      
      try {
        let date: Date;
        if (typeof dateValue === 'number') {
          // If it's a timestamp number
          date = new Date(dateValue);
        } else if (typeof dateValue === 'string') {
          // Try parsing as timestamp first
          const timestamp = parseInt(dateValue);
          if (!isNaN(timestamp) && dateValue.trim().length >= 10) {
            date = new Date(timestamp);
          } else {
            // Otherwise parse as date string
            date = new Date(dateValue);
          }
        } else {
          date = new Date(dateValue);
        }
        
        if (isNaN(date.getTime())) {
          return 'N/A';
        }
        
        return date.toLocaleDateString();
      } catch (error) {
        return 'N/A';
      }
    };
    
    // Get user name - check review.user first (direct user field), then order.user
    const userName = (review as any)?.user?.name || 
                     review.order?.user?.name || 
                     (review.order as any)?.customer?.name || 
                     'N/A';
    
    return (
      <div className="col-12 sm:col-6 lg:col-4 xl:col-3 mb-2">
        <ProfileCard
          name={userName}
          orderedItems={review.order?.items?.map((item) => item?.title || '').join(', ') || 'N/A'}
          rating={review.rating || 0}
          imageSrc={review.restaurant?.image || ''}
          reviewContent={review.description || ''}
          orderId={review.order?.orderId || 'N/A'}
          createdAt={formatDate(review.createdAt)}
        />
      </div>
    );
  };

  return (
    <div className="flex flex-col justify-center">
      <DataView
        value={products}
        itemTemplate={itemTemplate}
        paginator
        rows={5}
        layout="grid"
        header={header}
      />
    </div>
  );
};

export default CustomDataView;
