import { gql } from '@apollo/client';

export const CREATE_VENDOR = gql`
  mutation CreateVendor($vendorInput: VendorInput) {
    createVendor(vendorInput: $vendorInput) {
      _id
      email
      name
      image
      phone
      role
      isActive
    }
  }
`;

export const EDIT_VENDOR = gql`
  mutation EditVendor($vendorInput: VendorInput) {
    editVendor(vendorInput: $vendorInput) {
      _id
      email
      name
      image
      phone
      role
      isActive
    }
  }
`;

export const DELETE_VENDOR = gql`
  mutation DeleteVendor($id: String!) {
    deleteVendor(id: $id)
  }
`;
