'use client';

// Core imports
import { useContext } from 'react';

// PrimeReact components
import { Sidebar } from 'primereact/sidebar';

// Context
import { FoodsContext } from '@/lib/context/restaurant/foods.context';

// Interfaces
import { IFoodAddFormComponentProps } from '@/lib/utils/interfaces';

// Components
import FoodDetails from './food.index';

const FoodForm = ({ position = 'right' }: IFoodAddFormComponentProps) => {
  // Context
  const {
    isFoodFormVisible,
    onClearFoodData,
  } = useContext(FoodsContext);

  // Handlers
  const onSidebarHideHandler = () => {
    onClearFoodData();
  };

  return (
    <Sidebar
      visible={isFoodFormVisible}
      position={position}
      onHide={onSidebarHideHandler}
      className="w-full sm:w-[600px]"
    >
      <div className="p-4">
        <FoodDetails
          stepperProps={{
            onStepChange: () => {},
            order: 0,
          }}
          isFoodFormVisible={isFoodFormVisible}
        />
      </div>
    </Sidebar>
  );
};

export default FoodForm;
