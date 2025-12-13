import { gql } from '@apollo/client';

export const CREATE_FOOD = gql`
  mutation CreateProduct($restaurantId: ID!, $categoryId: ID, $productInput: ProductInput!) {
    createProduct(restaurantId: $restaurantId, categoryId: $categoryId, productInput: $productInput) {
      _id
      title
      description
      image
      price
      discountedPrice
      subCategory
      isActive
      available
      isOutOfStock
      variations {
        _id
        title
        price
        discounted
        addons
        isOutOfStock
      }
      createdAt
      updatedAt
    }
  }
`;

export const EDIT_FOOD = gql`
  mutation UpdateProduct($id: ID!, $productInput: ProductInput!) {
    updateProduct(id: $id, productInput: $productInput) {
      _id
      title
      description
      image
      price
      discountedPrice
      subCategory
      isActive
      available
      isOutOfStock
      variations {
        _id
        title
        price
        discounted
        addons
        isOutOfStock
      }
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_FOOD = gql`
  mutation DeleteFood($id: ID!) {
    deleteProduct(id: $id)
  }
`;
