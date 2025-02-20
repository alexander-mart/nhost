import Container from '@/components/layout/Container';
import SettingsLayout from '@/components/settings/SettingsLayout';
import AnonymousSignInSettings from '@/components/settings/signInMethods/AnonymousSignInSettings';
import AppleProviderSettings from '@/components/settings/signInMethods/AppleProviderSettings';
import DiscordProviderSettings from '@/components/settings/signInMethods/DiscordProviderSettings';
import EmailSettings from '@/components/settings/signInMethods/EmailSettings';
import FacebookProviderSettings from '@/components/settings/signInMethods/FacebookProviderSettings';
import GitHubProviderSettings from '@/components/settings/signInMethods/GitHubProviderSettings';
import GoogleProviderSettings from '@/components/settings/signInMethods/GoogleProviderSettings';
import LinkedInProviderSettings from '@/components/settings/signInMethods/LinkedInProviderSettings';
import MagicLinkSettings from '@/components/settings/signInMethods/MagicLinkSettings';
import SMSSettings from '@/components/settings/signInMethods/SMSSettings';
import SpotifyProviderSettings from '@/components/settings/signInMethods/SpotifyProviderSettings';
import TwitchProviderSettings from '@/components/settings/signInMethods/TwitchProviderSettings';
import TwitterProviderSettings from '@/components/settings/signInMethods/TwitterProviderSettings';
import WebAuthnSettings from '@/components/settings/signInMethods/WebAuthnSettings';
import WindowsLiveProviderSettings from '@/components/settings/signInMethods/WindowsLiveProviderSettings';
import WorkOsProviderSettings from '@/components/settings/signInMethods/WorkOsProviderSettings';
import { useSignInMethodsQuery } from '@/generated/graphql';
import { useCurrentWorkspaceAndApplication } from '@/hooks/useCurrentWorkspaceAndApplication';
import ActivityIndicator from '@/ui/v2/ActivityIndicator';
import type { ReactElement } from 'react';

export default function SettingsSignInMethodsPage() {
  const { currentApplication } = useCurrentWorkspaceAndApplication();

  const { loading, error } = useSignInMethodsQuery({
    variables: {
      id: currentApplication?.id,
    },
    fetchPolicy: 'network-only',
  });

  if (loading) {
    return (
      <ActivityIndicator
        delay={1000}
        label="Loading Sign-In Methods Settings..."
        className="justify-center"
      />
    );
  }

  if (error) {
    throw error;
  }

  return (
    <Container
      className="max-w-5xl space-y-8 bg-fafafa"
      wrapperClassName="bg-fafafa"
    >
      <EmailSettings />
      <MagicLinkSettings />
      <WebAuthnSettings />
      <AnonymousSignInSettings />
      <SMSSettings />
      <GoogleProviderSettings />
      <GitHubProviderSettings />
      <LinkedInProviderSettings />
      <AppleProviderSettings />
      <WindowsLiveProviderSettings />
      <FacebookProviderSettings />
      <SpotifyProviderSettings />
      <TwitchProviderSettings />
      <DiscordProviderSettings />
      <TwitterProviderSettings />
      <WorkOsProviderSettings />
    </Container>
  );
}

SettingsSignInMethodsPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <SettingsLayout
      mainContainerProps={{
        className: 'bg-fafafa',
      }}
    >
      {page}
    </SettingsLayout>
  );
};
