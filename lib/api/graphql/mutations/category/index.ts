import { gql } from '@apollo/client';

export const CREATE_CATEGORY = gql`
  mutation CreateCategory($category: CategoryInput!) {
    createCategory(category: $category) {
      _id
      title
      description
      image
      order
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
