import { gql } from '@apollo/client';

export const GET_VENDORS = gql`
  query vendors {
    vendors {
      unique_id
      _id
      email
      userType
      isActive
      name
      image
      restaurants {
        _id
      }
    }
    vendorCount @client
  }
`;

export const GET_VENDORS_L = gql`
  query vendors {
    vendors {
      _id
    }
  }
`;

export const GET_VENDOR_BY_ID = gql`
  query GetVendor($id: String!) {
    getVendor(vendorId: $id) {
      _id
      email
      userType
      name
      phone
      image
      role
      isActive
    }
  }
`;

export const GET_VENDOR_BY_ID_WITH_RESTAURANTS = gql`
  query GetVendor($id: String!) {
    getVendor(vendorId: $id) {
      _id
      email
      userType
      name
      phone
      image
      role
      isActive
      restaurants {
        _id
        orderId
        orderPrefix
        slug
        name
        image
        address
        location {
          coordinates
        }
        shopType
      }
    }
  }
`;
