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
import { IFast2SMSForm } from '@/lib/utils/interfaces/configurations.interface';

// Utils and Constants
import { Fast2SMSValidationSchema } from '@/lib/utils/schema/configuration';

// GraphQL
import {
  GET_CONFIGURATION,
  SAVE_FAST2SMS_CONFIGURATION,
} from '@/lib/api/graphql';
import { useMutation } from '@apollo/client';

const Fast2SMSAddForm = () => {
  // Hooks
  const { FAST2SMS_API_KEY, FAST2SMS_ENABLED, FAST2SMS_ROUTE } = useConfiguration();
  const { showToast } = useToast();

  const initialValues = {
    apiKey: FAST2SMS_API_KEY,
    enabled: FAST2SMS_ENABLED || false,
    route: FAST2SMS_ROUTE || 'q',
  };

  const [mutate, { loading: mutationLoading }] = useMutation(
    SAVE_FAST2SMS_CONFIGURATION,
    {
      refetchQueries: [{ query: GET_CONFIGURATION }],
    }
  );

  const handleSubmit = (values: IFast2SMSForm) => {
    mutate({
      variables: {
        configurationInput: {
          apiKey: values.apiKey,
          enabled: values.enabled,
          route: values.route,
        },
      },
      onCompleted: () => {
        showToast({
          type: 'success',
          title: 'Success!',
          message: 'Fast2SMS Configurations Updated',
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
        validationSchema={Fast2SMSValidationSchema}
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
                cardTitle={'Fast2SMS'}
                buttonLoading={mutationLoading}
                toggleLabel={'Enabled'}
                toggleOnChange={() => {
                  setFieldValue('enabled', !values.enabled);
                }}
                toggleValue={values.enabled}
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <CustomPasswordTextField
                    placeholder="API Key"
                    feedback={false}
                    name="apiKey"
                    maxLength={200}
                    value={values.apiKey}
                    showLabel={true}
                    onChange={handleChange}
                    style={{
                      borderColor:
                        errors.apiKey && touched.apiKey ? 'red' : '',
                    }}
                  />

                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                      Route
                    </label>
                    <select
                      name="route"
                      value={values.route}
                      onChange={handleChange}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="q">Quick (q)</option>
                      <option value="d">Promotional (d)</option>
                      <option value="t">Transactional (t)</option>
                    </select>
                    {errors.route && touched.route && (
                      <span className="text-red-500 text-xs mt-1">{errors.route}</span>
                    )}
                  </div>
                </div>
              </ConfigCard>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default Fast2SMSAddForm;
