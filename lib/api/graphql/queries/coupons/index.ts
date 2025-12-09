import { gql } from '@apollo/client';

export const GET_COUPONS = gql`
  query Coupons {
    coupons {
      _id
      title
      code
      discount
      enabled
    }
  }
`;
