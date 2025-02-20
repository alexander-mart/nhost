import Form from '@/components/common/Form';
import SettingsContainer from '@/components/settings/SettingsContainer';
import {
  useSignInMethodsQuery,
  useUpdateAppMutation,
} from '@/generated/graphql';
import { useCurrentWorkspaceAndApplication } from '@/hooks/useCurrentWorkspaceAndApplication';
import ActivityIndicator from '@/ui/v2/ActivityIndicator';
import IconButton from '@/ui/v2/IconButton';
import CopyIcon from '@/ui/v2/icons/CopyIcon';
import Input from '@/ui/v2/Input';
import InputAdornment from '@/ui/v2/InputAdornment';
import { copy } from '@/utils/copy';
import { toastStyleProps } from '@/utils/settings/settingsConstants';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { twMerge } from 'tailwind-merge';

export interface WorkOsProviderFormValues {
  authWorkOsEnabled: boolean;
  authWorkOsClientId: string;
  authWorkOsClientSecret: string;
  authWorkOsDefaultDomain: string;
  authWorkOsDefaultOrganization: string;
  authWorkOsDefaultConnection: string;
}

export default function WorkOsProviderSettings() {
  const { currentApplication } = useCurrentWorkspaceAndApplication();
  const [updateApp] = useUpdateAppMutation();

  const { data, loading, error } = useSignInMethodsQuery({
    variables: {
      id: currentApplication.id,
    },
    fetchPolicy: 'cache-only',
  });

  const form = useForm<WorkOsProviderFormValues>({
    reValidateMode: 'onSubmit',
    defaultValues: {
      authWorkOsClientId: data?.app?.authWorkOsClientId,
      authWorkOsClientSecret: data?.app?.authWorkOsClientSecret,
      authWorkOsDefaultDomain: data?.app?.authWorkOsDefaultDomain,
      authWorkOsDefaultOrganization: data?.app?.authWorkOsDefaultOrganization,
      authWorkOsDefaultConnection: data?.app?.authWorkOsDefaultConnection,
      authWorkOsEnabled: data?.app?.authWorkOsEnabled,
    },
  });

  if (loading) {
    return (
      <ActivityIndicator
        delay={1000}
        label="Loading WorkOS settings..."
        className="justify-center"
      />
    );
  }

  if (error) {
    throw error;
  }

  const { register, formState, watch } = form;
  const authEnabled = watch('authWorkOsEnabled');

  const handleProviderUpdate = async (values: WorkOsProviderFormValues) => {
    const updateAppMutation = updateApp({
      variables: {
        id: currentApplication.id,
        app: {
          ...values,
        },
      },
    });

    await toast.promise(
      updateAppMutation,
      {
        loading: `WorkOS settings are being updated...`,
        success: `WorkOS settings have been updated successfully.`,
        error: `An error occurred while trying to update the project's WorkOS settings.`,
      },
      { ...toastStyleProps },
    );

    form.reset(values);
  };

  return (
    <FormProvider {...form}>
      <Form onSubmit={handleProviderUpdate}>
        <SettingsContainer
          title="WorkOS"
          description="Allows users to sign in with WorkOS."
          primaryActionButtonProps={{
            disabled: !formState.isValid || !formState.isDirty,
            loading: formState.isSubmitting,
          }}
          icon="/logos/WorkOs.svg"
          switchId="authWorkOsEnabled"
          showSwitch
          enabled={authEnabled}
          className={twMerge(
            'grid-flow-rows grid grid-cols-6 grid-rows-2 gap-y-4 gap-x-3 px-4 py-2',
            !authEnabled && 'hidden',
          )}
        >
          <Input
            {...register(`authWorkOsClientId`)}
            name="authWorkOsClientId"
            id="authWorkOsClientId"
            label="WorkOS Client ID"
            placeholder="WorkOS Client ID"
            className="col-span-3"
            fullWidth
            hideEmptyHelperText
          />
          <Input
            {...register('authWorkOsClientSecret')}
            name="authWorkOsClientSecret"
            id="authWorkOsClientSecret"
            label="WorkOS Client Secret"
            placeholder="WorkOS Client Secret"
            className="col-span-3"
            fullWidth
            hideEmptyHelperText
          />
          <Input
            {...register('authWorkOsDefaultDomain')}
            name="authWorkOsDefaultDomain"
            id="authWorkOsDefaultDomain"
            label="Default Domain"
            placeholder="Default Domain"
            className="col-span-2"
            fullWidth
            hideEmptyHelperText
          />
          <Input
            {...register('authWorkOsDefaultOrganization')}
            name="authWorkOsDefaultOrganization"
            id="authWorkOsDefaultOrganization"
            label="Default Organization"
            placeholder="Default Organization"
            className="col-span-2"
            fullWidth
            hideEmptyHelperText
          />
          <Input
            {...register('authWorkOsDefaultConnection')}
            name="authWorkOsDefaultConnection"
            id="authWorkOsDefaultConnection"
            label="Default Connection"
            placeholder="Default Connection"
            className="col-span-2"
            fullWidth
            hideEmptyHelperText
          />
          <Input
            name="redirectUrl"
            id="redirectUrl"
            placeholder={`https://${currentApplication.subdomain}.nhost.run/auth/signin/provider/workos/callback`}
            className="col-span-6"
            fullWidth
            hideEmptyHelperText
            label="Redirect URL"
            disabled
            slotProps={{
              input: {
                className: 'bg-opacity-5',
              },
            }}
            endAdornment={
              <InputAdornment position="end" className="absolute right-2">
                <IconButton
                  sx={{ minWidth: 0, padding: 0 }}
                  color="secondary"
                  variant="borderless"
                  onClick={(e) => {
                    e.stopPropagation();
                    copy(
                      `https://${currentApplication.subdomain}.nhost.run/auth/signin/provider/workos/callback`,
                      'Redirect URL',
                    );
                  }}
                >
                  <CopyIcon className="h-4 w-4" />
                </IconButton>
              </InputAdornment>
            }
          />
        </SettingsContainer>
      </Form>
    </FormProvider>
  );
}
