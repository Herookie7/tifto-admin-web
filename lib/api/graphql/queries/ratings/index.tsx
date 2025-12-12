import { gql } from '@apollo/client';
export const GET_REVIEWS = gql`
  query Reviews($restaurant: String!) {
    reviewsByRestaurant(restaurant: $restaurant) {
      reviews {
        _id
        order {
          _id
          orderId
          items {
            title
          }
          user {
            _id
            name
            email
          }
        }
        restaurant {
          _id
          name
          image
        }
        rating
        description
        createdAt
      }
      ratings
      total
    }
  }
`;
