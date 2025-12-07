import { gql } from '@apollo/client';

export const SUBSCRIPTION_PLACE_ORDER = gql`
  subscription SubscribePlaceOrder($restaurant: String!) {
    subscribePlaceOrder(restaurant: $restaurant) {
      userId
      origin
      order {
        _id
        orderId
        restaurant {
          _id
          name
          image
          address
          location {
            coordinates
          }
        }
        deliveryAddress {
          location {
            coordinates
          }
          deliveryAddress
          details
          label
        }
        items {
          _id
          title
          description
          image
          quantity
          variation {
            _id
            title
            price
            discounted
          }
          addons {
            _id
            options {
              _id
              title
              description
              price
            }
            description
            title
            quantityMinimum
            quantityMaximum
          }
          specialInstructions
          isActive
          createdAt
          updatedAt
        }
        user {
          _id
          name
          phone
          email
        }
        paymentMethod
        paidAmount
        orderAmount
        orderStatus
        status
        paymentStatus
        reason
        isActive
        createdAt
        deliveryCharges
        rider {
          _id
          name
          username
          available
        }
      }
    }
  }
`;

// Note: subscriptionDispatcher does not exist in the GraphQL schema
// Use subscriptionOrder or subscribePlaceOrder instead
// This subscription has been removed to fix GraphQL errors
export const SUBSCRIPTION_DISPATCH_ORDER = null;

export const SUBSCRIPTION_ORDER = gql`
  subscription SubscriptionOrder($id: String!) {
    subscriptionOrder(id: $id) {
      _id
      orderStatus
      rider {
        _id
      }
    }
  }
`;
