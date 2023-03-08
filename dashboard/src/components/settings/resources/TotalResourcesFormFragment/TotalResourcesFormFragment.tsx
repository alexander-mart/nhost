import { useCurrentWorkspaceAndApplication } from '@/hooks/useCurrentWorkspaceAndApplication';
import { Alert } from '@/ui/Alert';
import Box from '@/ui/v2/Box';
import ArrowRightIcon from '@/ui/v2/icons/ArrowRightIcon';
import Slider, { sliderClasses } from '@/ui/v2/Slider';
import Text from '@/ui/v2/Text';
import {
  RESOURCE_VCPU_MEMORY_RATIO,
  RESOURCE_VCPU_PRICE,
  RESOURCE_VCPU_STEP,
} from '@/utils/CONSTANTS';
import getUnallocatedResources from '@/utils/settings/getUnallocatedResources';
import type { ResourceSettingsFormValues } from '@/utils/settings/resourceSettingsValidationSchema';
import {
  MAX_TOTAL_VCPU,
  MIN_TOTAL_MEMORY,
  MIN_TOTAL_VCPU,
} from '@/utils/settings/resourceSettingsValidationSchema';
import { alpha, styled } from '@mui/material';
import { useFormContext, useFormState, useWatch } from 'react-hook-form';

export interface TotalResourcesFormFragmentProps {
  /**
   * The initial price of the resources.
   */
  initialPrice: number;
}

const StyledAvailableCpuSlider = styled(Slider)(({ theme }) => ({
  [`& .${sliderClasses.rail}`]: {
    backgroundColor: alpha(theme.palette.primary.main, 0.15),
  },
}));

export default function TotalResourcesFormFragment({
  initialPrice,
}: TotalResourcesFormFragmentProps) {
  const { currentApplication } = useCurrentWorkspaceAndApplication();
  const { dirtyFields } = useFormState<ResourceSettingsFormValues>();
  const { setValue } = useFormContext<ResourceSettingsFormValues>();
  const formValues = useWatch<ResourceSettingsFormValues>();

  const allocatedCPU =
    formValues.databaseCPU +
    formValues.hasuraCPU +
    formValues.authCPU +
    formValues.storageCPU;
  const allocatedMemory =
    formValues.databaseMemory +
    formValues.hasuraMemory +
    formValues.authMemory +
    formValues.storageMemory;

  const updatedPrice =
    RESOURCE_VCPU_PRICE * formValues.totalSelectedCPU +
    currentApplication.plan.price;

  const { cpu: unallocatedCPU, memory: unallocatedMemory } =
    getUnallocatedResources(formValues);

  const showAlert =
    Object.keys(dirtyFields).filter((key) => key !== 'enabled').length > 0;
  const hasUnusedResources = unallocatedCPU > 0 || unallocatedMemory > 0;
  const unusedResourceMessage = [
    unallocatedCPU > 0 ? `${unallocatedCPU} vCPUs` : '',
    unallocatedMemory > 0 ? `${unallocatedMemory} GiB of memory` : '',
  ]
    .filter(Boolean)
    .join(' and ');

  function handleCPUChange(value: string) {
    const updatedCPU = parseFloat(value);
    const updatedMemory = updatedCPU * RESOURCE_VCPU_MEMORY_RATIO;

    if (
      Number.isNaN(updatedCPU) ||
      updatedCPU < Math.max(MIN_TOTAL_VCPU, allocatedCPU) ||
      updatedMemory < Math.max(MIN_TOTAL_MEMORY, allocatedMemory)
    ) {
      return;
    }

    setValue('totalSelectedCPU', updatedCPU, { shouldDirty: true });
    setValue('totalSelectedMemory', updatedMemory, { shouldDirty: true });
  }

  return (
    <Box className="px-4 pb-4">
      <Box className="rounded-md border">
        <Box className="flex flex-col gap-4 bg-transparent p-4">
          <Box className="flex flex-row items-center justify-between gap-4">
            <Text color="secondary">
              Total available resources for your project:
            </Text>

            {initialPrice !== updatedPrice && (
              <Text className="flex flex-row items-center justify-end gap-2">
                <Text component="span" color="secondary">
                  ${initialPrice.toFixed(2)}/mo
                </Text>
                <ArrowRightIcon />
                <Text component="span" className="font-medium">
                  ${updatedPrice.toFixed(2)}/mo
                </Text>
              </Text>
            )}
          </Box>

          <Box className="flex flex-row items-center justify-start gap-4">
            <Text color="secondary">
              vCPUs:{' '}
              <Text component="span" color="primary" className="font-medium">
                {formValues.totalSelectedCPU}
              </Text>
            </Text>

            <Text color="secondary">
              Memory:{' '}
              <Text component="span" color="primary" className="font-medium">
                {formValues.totalSelectedMemory} GiB
              </Text>
            </Text>
          </Box>

          <StyledAvailableCpuSlider
            value={formValues.totalSelectedCPU}
            onChange={(_event, value) => handleCPUChange(value.toString())}
            max={MAX_TOTAL_VCPU}
            step={RESOURCE_VCPU_STEP}
            aria-label="Total Available vCPU"
          />
        </Box>

        {showAlert && (
          <Alert
            severity={hasUnusedResources ? 'warning' : 'info'}
            className="grid grid-flow-row gap-2 rounded-t-none rounded-b-[5px] text-left"
          >
            {hasUnusedResources ? (
              <>
                <strong>Please use all the available vCPUs and Memory</strong>

                <p>
                  You now have {unusedResourceMessage} unused. Allocate it to
                  any of the services before saving.
                </p>
              </>
            ) : (
              <>
                <strong>You&apos;re All Set</strong>

                <p>
                  You have successfully allocated all the available vCPUs and
                  Memory.
                </p>
              </>
            )}
          </Alert>
        )}
      </Box>
    </Box>
  );
}
