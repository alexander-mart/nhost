import Form from '@/components/common/Form';
import { useCurrentWorkspaceAndApplication } from '@/hooks/useCurrentWorkspaceAndApplication';
import type { DialogFormProps } from '@/types/common';
import { Alert } from '@/ui/Alert';
import Button from '@/ui/v2/Button';
import Input from '@/ui/v2/Input';
import generateAppServiceUrl from '@/utils/common/generateAppServiceUrl';
import { getToastStyleProps } from '@/utils/settings/settingsConstants';
import { yupResolver } from '@hookform/resolvers/yup';
import axios from 'axios';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import * as Yup from 'yup';

export interface CreateUserFormProps extends DialogFormProps {
  /**
   * Function to be called when the operation is cancelled.
   */
  onCancel?: VoidFunction;
  /**
   * Function to be called when the submit is successful.
   */
  onSubmit?: VoidFunction | ((args?: any) => Promise<any>);
}

export const validationSchema = Yup.object({
  email: Yup.string()
    .min(5, 'Email must be at least 5 characters long.')
    .email('Invalid email address')
    .required('This field is required.'),
  password: Yup.string()
    .label('Users Password')
    .min(8, 'Password must be at least 8 characters long.')
    .required('This field is required.'),
});

export type CreateUserFormValues = Yup.InferType<typeof validationSchema>;

export default function CreateUserForm({
  onSubmit,
  onCancel,
}: CreateUserFormProps) {
  const { currentApplication } = useCurrentWorkspaceAndApplication();
  const [createUserFormError, setCreateUserFormError] = useState<Error | null>(
    null,
  );

  const form = useForm<CreateUserFormValues>({
    defaultValues: {},
    reValidateMode: 'onSubmit',
    resolver: yupResolver(validationSchema),
  });

  const {
    register,
    formState: { errors, isSubmitting },
    setError,
  } = form;

  const baseAuthUrl = generateAppServiceUrl(
    currentApplication?.subdomain,
    currentApplication?.region?.awsName,
    'auth',
  );

  const signUpUrl = `${baseAuthUrl}/signup/email-password`;

  async function handleCreateUser({ email, password }: CreateUserFormValues) {
    setCreateUserFormError(null);

    try {
      await toast.promise(
        axios.post(signUpUrl, {
          email,
          password,
        }),
        {
          loading: 'Creating user...',
          success: 'User created successfully.',
          error: 'An error occurred while trying to create the user.',
        },
        getToastStyleProps(),
      );
      onSubmit?.();
    } catch (error) {
      if (error.response?.status === 409) {
        setError('email', {
          message: error.response.data.message,
        });
        return;
      }
      setCreateUserFormError(
        new Error(error.response.data.message || 'Something went wrong.'),
      );
    }
  }

  return (
    <FormProvider {...form}>
      <Form
        onSubmit={handleCreateUser}
        className="grid grid-flow-row gap-4 px-6 pb-6"
      >
        <Input
          {...register('email')}
          id="email"
          label="Email"
          placeholder="Enter Email"
          hideEmptyHelperText
          error={!!errors.email}
          helperText={errors?.email?.message}
          fullWidth
          autoComplete="off"
          autoFocus
        />
        <Input
          {...register('password')}
          id="password"
          label="Password"
          placeholder="Enter Password"
          hideEmptyHelperText
          error={!!errors.password}
          helperText={errors?.password?.message}
          fullWidth
          autoComplete="off"
          type="password"
        />
        {createUserFormError && (
          <Alert
            severity="error"
            className="grid grid-flow-col items-center justify-between px-4 py-3"
          >
            <span className="text-left">
              <strong>Error:</strong> {createUserFormError.message}
            </span>

            <Button
              variant="borderless"
              color="error"
              size="small"
              onClick={() => {
                setCreateUserFormError(null);
              }}
            >
              Clear
            </Button>
          </Alert>
        )}
        <div className="grid grid-flow-row gap-2">
          <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
            Create
          </Button>

          <Button variant="outlined" color="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </Form>
    </FormProvider>
  );
}
