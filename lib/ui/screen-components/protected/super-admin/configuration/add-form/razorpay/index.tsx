'use client';
// Core
import { Form, Formik } from 'formik';

// Components
import CustomPasswordTextField from '@/lib/ui/useable-components/password-input-field';
import ConfigCard from '../../view/card';

// Toast
import useToast from '@/lib/hooks/useToast';

// Hooks
import { useConfiguration } from '@/lib/hooks/useConfiguration';

// Interfaces and Types
import { IRazorpayForm } from '@/lib/utils/interfaces/configurations.interface';

// Utils and Constants
import { RazorpayValidationSchema } from '@/lib/utils/schema/configuration';

// GraphQL
import {
  GET_CONFIGURATION,
  SAVE_RAZORPAY_CONFIGURATION,
} from '@/lib/api/graphql';
import { useMutation } from '@apollo/client';

const RazorpayAddForm = () => {
  // Hooks
  const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_SANDBOX } = useConfiguration();
  const { showToast } = useToast();

  const initialValues = {
    keyId: RAZORPAY_KEY_ID,
    keySecret: RAZORPAY_KEY_SECRET,
    sandbox: RAZORPAY_SANDBOX || false,
  };

  const [mutate, { loading: mutationLoading }] = useMutation(
    SAVE_RAZORPAY_CONFIGURATION,
    {
      refetchQueries: [{ query: GET_CONFIGURATION }],
    }
  );

  const handleSubmit = (values: IRazorpayForm) => {
    mutate({
      variables: {
        configurationInput: {
          keyId: values.keyId,
          keySecret: values.keySecret,
          sandbox: values.sandbox,
        },
      },
      onCompleted: () => {
        showToast({
          type: 'success',
          title: 'Success!',
          message: 'Razorpay Configurations Updated',
          duration: 3000,
        });
      },
      onError: (error) => {
        let message = '';
        try {
          message = error.graphQLErrors[0]?.message;
        } catch (err) {
          message = 'ActionFailedTryAgain';
        }
        showToast({
          type: 'error',
          title: 'Error!',
          message,
          duration: 3000,
        });
      },
    });
  };

  return (
    <div>
      <Formik
        initialValues={initialValues}
        validationSchema={RazorpayValidationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({
          values,
          errors,
          touched,
          handleSubmit,
          handleChange,
          setFieldValue,
        }) => {
          return (
            <Form onSubmit={handleSubmit}>
              <ConfigCard
                cardTitle={'Razorpay'}
                buttonLoading={mutationLoading}
                toggleLabel={'Sandbox'}
                toggleOnChange={() => {
                  setFieldValue('sandbox', !values.sandbox);
                }}
                toggleValue={values.sandbox}
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <CustomPasswordTextField
                    placeholder="Key ID"
                    feedback={false}
                    name="keyId"
                    maxLength={100}
                    value={values.keyId}
                    showLabel={true}
                    onChange={handleChange}
                    style={{
                      borderColor:
                        errors.keyId && touched.keyId ? 'red' : '',
                    }}
                  />

                  <CustomPasswordTextField
                    placeholder="Key Secret"
                    feedback={false}
                    name="keySecret"
                    maxLength={100}
                    value={values.keySecret}
                    showLabel={true}
                    onChange={handleChange}
                    style={{
                      borderColor:
                        errors.keySecret && touched.keySecret ? 'red' : '',
                    }}
                  />
                </div>
              </ConfigCard>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default RazorpayAddForm;
