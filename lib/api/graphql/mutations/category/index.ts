import { gql } from '@apollo/client';

export const CREATE_CATEGORY = gql`
  mutation CreateCategory(
    $restaurantId: ID!
    $title: String!
    $description: String
    $image: String
  ) {
    createCategory(
      restaurantId: $restaurantId
      title: $title
      description: $description
      image: $image
    ) {
      _id
      title
      description
      image
      createdAt
      updatedAt
    }
  }
`;

export const EDIT_CATEGORY = gql`
  mutation EditCategory(
    $id: ID!
    $title: String
    $description: String
    $image: String
    $order: Int
    $isActive: Boolean
  ) {
    updateCategory(
      id: $id
      title: $title
      description: $description
      image: $image
      order: $order
      isActive: $isActive
    ) {
      _id
      title
      description
      image
      order
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_CATEGORY = gql`
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id)
  }
`;
