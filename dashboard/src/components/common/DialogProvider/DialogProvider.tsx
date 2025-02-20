import RetryableErrorBoundary from '@/components/common/RetryableErrorBoundary';
import { CreateForeignKeyForm } from '@/components/data-browser/CreateForeignKeyForm';
import { EditForeignKeyForm } from '@/components/data-browser/EditForeignKeyForm';
import ActivityIndicator from '@/ui/v2/ActivityIndicator';
import AlertDialog from '@/ui/v2/AlertDialog';
import { BaseDialog } from '@/ui/v2/Dialog';
import Drawer from '@/ui/v2/Drawer';
import dynamic from 'next/dynamic';
import type { BaseSyntheticEvent, PropsWithChildren } from 'react';
import { useCallback, useMemo, useReducer, useRef, useState } from 'react';
import type { DialogConfig, DialogType } from './DialogContext';
import DialogContext from './DialogContext';
import {
  alertDialogReducer,
  dialogReducer,
  drawerReducer,
} from './dialogReducers';

function LoadingComponent() {
  return (
    <div className="grid items-center justify-center px-6 py-4">
      <ActivityIndicator
        circularProgressProps={{ className: 'w-5 h-5' }}
        label="Loading form..."
        delay={500}
      />
    </div>
  );
}

const CreateRecordForm = dynamic(
  () => import('@/components/data-browser/CreateRecordForm'),
  { ssr: false, loading: LoadingComponent },
);

const CreateColumnForm = dynamic(
  () => import('@/components/data-browser/CreateColumnForm'),
  { ssr: false, loading: LoadingComponent },
);

const EditColumnForm = dynamic(
  () => import('@/components/data-browser/EditColumnForm'),
  { ssr: false, loading: LoadingComponent },
);

const CreateTableForm = dynamic(
  () => import('@/components/data-browser/CreateTableForm'),
  { ssr: false, loading: LoadingComponent },
);

const EditTableForm = dynamic(
  () => import('@/components/data-browser/EditTableForm'),
  { ssr: false, loading: LoadingComponent },
);

function DialogProvider({ children }: PropsWithChildren<unknown>) {
  const [
    {
      open: dialogOpen,
      activeDialogType,
      dialogProps,
      title: dialogTitle,
      payload: dialogPayload,
    },
    dialogDispatch,
  ] = useReducer(dialogReducer, {
    open: false,
  });

  const [
    {
      open: drawerOpen,
      activeDialogType: activeDrawerType,
      dialogProps: drawerProps,
      title: drawerTitle,
      payload: drawerPayload,
    },
    drawerDispatch,
  ] = useReducer(drawerReducer, {
    open: false,
  });

  const [
    {
      open: alertDialogOpen,
      dialogProps: alertDialogProps,
      title: alertDialogTitle,
      payload: alertDialogPayload,
    },
    alertDialogDispatch,
  ] = useReducer(alertDialogReducer, {
    open: false,
  });

  const isDrawerDirty = useRef(false);
  const isDialogDirty = useRef(false);
  const [showDirtyConfirmation, setShowDirtyConfirmation] = useState(false);

  const openDialog = useCallback(
    <TConfig,>(type: DialogType, config?: DialogConfig<TConfig>) => {
      dialogDispatch({ type: 'OPEN_DIALOG', payload: { type, config } });
    },
    [],
  );

  const closeDialog = useCallback(() => {
    dialogDispatch({ type: 'HIDE_DIALOG' });
    isDialogDirty.current = false;
  }, []);

  const clearDialogContent = useCallback(() => {
    dialogDispatch({ type: 'CLEAR_DIALOG_CONTENT' });
  }, []);

  const openDrawer = useCallback(
    <TConfig,>(type: DialogType, config?: DialogConfig<TConfig>) => {
      drawerDispatch({ type: 'OPEN_DRAWER', payload: { type, config } });
    },
    [],
  );

  const closeDrawer = useCallback(() => {
    drawerDispatch({ type: 'HIDE_DRAWER' });
    isDrawerDirty.current = false;
  }, []);

  const clearDrawerContent = useCallback(() => {
    drawerDispatch({ type: 'CLEAR_DRAWER_CONTENT' });
  }, []);

  function openAlertDialog<TConfig = string>(config?: DialogConfig<TConfig>) {
    alertDialogDispatch({ type: 'OPEN_ALERT', payload: config });
  }

  function closeAlertDialog() {
    alertDialogDispatch({ type: 'HIDE_ALERT' });
    setShowDirtyConfirmation(false);
  }

  function clearAlertDialogContent() {
    alertDialogDispatch({ type: 'CLEAR_ALERT_CONTENT' });
  }

  function openDirtyConfirmation(config?: Partial<DialogConfig<string>>) {
    const { props, ...restConfig } = config || {};

    openAlertDialog({
      ...config,
      title: 'Unsaved changes',
      payload:
        'You have unsaved local changes. Are you sure you want to discard them?',
      props: {
        ...props,
        primaryButtonText: 'Discard',
        primaryButtonColor: 'error',
      },
      ...restConfig,
    });
  }

  function closeDrawerWithDirtyGuard(event?: BaseSyntheticEvent) {
    if (isDrawerDirty.current && event?.type !== 'submit') {
      setShowDirtyConfirmation(true);
      openDirtyConfirmation({ props: { onPrimaryAction: closeDrawer } });
      return;
    }

    closeDrawer();
  }

  function closeDialogWithDirtyGuard(event?: BaseSyntheticEvent) {
    if (isDialogDirty.current && event?.type !== 'submit') {
      setShowDirtyConfirmation(true);
      openDirtyConfirmation({ props: { onPrimaryAction: closeDialog } });
      return;
    }

    closeDialog();
  }

  // We are coupling this logic with the location of the dialog content which is
  // not ideal. We shoule figure out a better logic for tracking the dirty
  // state in the future.
  const onDirtyStateChange = useCallback(
    (dirty: boolean, location: 'drawer' | 'dialog' = 'drawer') => {
      if (location === 'dialog') {
        isDialogDirty.current = dirty;

        return;
      }

      if (location === 'drawer') {
        isDrawerDirty.current = dirty;
      }
    },
    [],
  );

  const contextValue = useMemo(
    () => ({
      openDialog,
      openDrawer,
      openAlertDialog,
      closeDialog,
      closeDrawer,
      closeAlertDialog,
      onDirtyStateChange,
    }),
    [closeDialog, closeDrawer, onDirtyStateChange, openDialog, openDrawer],
  );

  return (
    <DialogContext.Provider value={contextValue}>
      <AlertDialog
        {...alertDialogProps}
        title={alertDialogTitle}
        message={alertDialogPayload}
        hideTitle={alertDialogProps?.hideTitle}
        open={alertDialogOpen || showDirtyConfirmation}
        onClose={closeAlertDialog}
        onSecondaryAction={() => {
          if (alertDialogProps?.onSecondaryAction) {
            alertDialogProps.onSecondaryAction();
          }

          closeAlertDialog();
        }}
        onPrimaryAction={() => {
          if (alertDialogProps?.onPrimaryAction) {
            alertDialogProps.onPrimaryAction();
          }

          closeAlertDialog();
        }}
        TransitionProps={{
          onExited: (node) => {
            if (alertDialogProps?.TransitionProps?.onExited) {
              alertDialogProps.TransitionProps.onExited(node);
            }

            clearAlertDialogContent();
          },
        }}
      />

      <BaseDialog
        {...dialogProps}
        title={dialogTitle}
        open={dialogOpen}
        onClose={closeDialogWithDirtyGuard}
        TransitionProps={{ onExited: clearDialogContent, unmountOnExit: false }}
        PaperProps={{ className: 'max-w-md w-full' }}
      >
        <RetryableErrorBoundary
          errorMessageProps={{ className: 'pt-0 pb-5 px-6' }}
        >
          {activeDialogType === 'CREATE_FOREIGN_KEY' && (
            <CreateForeignKeyForm
              {...dialogPayload}
              onSubmit={async (values) => {
                await dialogPayload?.onSubmit(values);

                closeDialog();
              }}
              onCancel={closeDialogWithDirtyGuard}
            />
          )}

          {activeDialogType === 'EDIT_FOREIGN_KEY' && (
            <EditForeignKeyForm
              {...dialogPayload}
              onSubmit={async (values) => {
                await dialogPayload?.onSubmit(values);

                closeDialog();
              }}
              onCancel={closeDialogWithDirtyGuard}
            />
          )}
        </RetryableErrorBoundary>
      </BaseDialog>

      <Drawer
        {...drawerProps}
        title={drawerTitle}
        open={drawerOpen}
        onClose={closeDrawerWithDirtyGuard}
        SlideProps={{ onExited: clearDrawerContent, unmountOnExit: false }}
        anchor="right"
        PaperProps={{ className: 'max-w-2.5xl w-full' }}
      >
        <RetryableErrorBoundary>
          {activeDrawerType === 'CREATE_RECORD' && (
            <CreateRecordForm
              columns={drawerPayload?.columns}
              onSubmit={async () => {
                await drawerPayload?.onSubmit();

                closeDrawer();
              }}
              onCancel={closeDrawerWithDirtyGuard}
            />
          )}

          {activeDrawerType === 'CREATE_COLUMN' && (
            <CreateColumnForm
              onSubmit={async () => {
                await drawerPayload?.onSubmit();

                closeDrawer();
              }}
              onCancel={closeDrawerWithDirtyGuard}
            />
          )}

          {activeDrawerType === 'EDIT_COLUMN' && (
            <EditColumnForm
              column={drawerPayload?.column}
              onSubmit={async () => {
                await drawerPayload?.onSubmit();

                closeDrawer();
              }}
              onCancel={closeDrawerWithDirtyGuard}
            />
          )}

          {activeDrawerType === 'CREATE_TABLE' && (
            <CreateTableForm
              schema={drawerPayload?.schema}
              onSubmit={async () => {
                await drawerPayload?.onSubmit();

                closeDrawer();
              }}
              onCancel={closeDrawerWithDirtyGuard}
            />
          )}

          {activeDrawerType === 'EDIT_TABLE' && (
            <EditTableForm
              table={drawerPayload?.table}
              schema={drawerPayload?.schema}
              onSubmit={async () => {
                await drawerPayload?.onSubmit();

                closeDrawer();
              }}
              onCancel={closeDrawerWithDirtyGuard}
            />
          )}
        </RetryableErrorBoundary>
      </Drawer>

      {children}
    </DialogContext.Provider>
  );
}

DialogProvider.displayName = 'NhostDialogProvider';

export default DialogProvider;
