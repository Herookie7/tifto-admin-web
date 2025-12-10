import { gql } from '@apollo/client';
export const updateCommission = gql`
  mutation UpdateCommission($id: String!, $commissionType: String!, $commissionRate: Float!) {
    updateCommission(id: $id, commissionType: $commissionType, commissionRate: $commissionRate) {
      _id
      commissionRate
      commissionType
    }
  }
`;
