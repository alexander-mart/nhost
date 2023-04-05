import { useDialog } from '@/components/common/DialogProvider';
import { EditWorkspaceNameForm } from '@/components/home/EditWorkspaceNameForm';
import { Resource } from '@/components/home/Resource';
import GithubIcon from '@/components/icons/GithubIcon';
import type { Workspace } from '@/types/application';
import ActivityIndicator from '@/ui/v2/ActivityIndicator';
import type { BoxProps } from '@/ui/v2/Box';
import Box from '@/ui/v2/Box';
import Button from '@/ui/v2/Button';
import List from '@/ui/v2/List';
import { ListItem } from '@/ui/v2/ListItem';
import Text from '@/ui/v2/Text';
import PlusCircleIcon from '@/ui/v2/icons/PlusCircleIcon';
import useTranslation from 'next-translate/useTranslation';
import Image from 'next/image';
import NavLink from 'next/link';
import { twMerge } from 'tailwind-merge';

export interface SidebarProps extends BoxProps {
  /**
   * List of workspaces to be displayed.
   */
  workspaces: Workspace[];
}

export default function Sidebar({
  className,
  workspaces,
  ...props
}: SidebarProps) {
  const { openDialog } = useDialog();
  const { t } = useTranslation('home');

  return (
    <Box
      component="aside"
      className={twMerge(
        'grid w-full grid-flow-row content-start gap-8 md:grid',
        className,
      )}
      {...props}
    >
      <section className="grid grid-flow-row gap-2">
        <Text color="secondary">{t('labels.workspaces')}</Text>

        {workspaces.length > 0 ? (
          <List className="grid grid-flow-row gap-2">
            {workspaces.map(({ id, name, slug }) => (
              <ListItem.Root key={id}>
                <NavLink href={`/${slug}`} passHref>
                  <ListItem.Button
                    dense
                    aria-label={`View ${name}`}
                    className="!p-1"
                  >
                    <ListItem.Avatar className="h-8 w-8">
                      <div className="inline-block h-8 w-8 overflow-hidden rounded-lg">
                        <Image
                          src="/logos/new.svg"
                          alt="Nhost Logo"
                          width={32}
                          height={32}
                        />
                      </div>
                    </ListItem.Avatar>
                    <ListItem.Text primary={name} />
                  </ListItem.Button>
                </NavLink>
              </ListItem.Root>
            ))}
          </List>
        ) : (
          <ActivityIndicator
            label="Creating your first workspace..."
            className="py-1"
          />
        )}

        <Button
          variant="borderless"
          color="secondary"
          startIcon={<PlusCircleIcon />}
          className="justify-self-start"
          onClick={() => {
            openDialog({
              title: (
                <span className="grid grid-flow-row">
                  <span>{t('workspaceModal.title')}</span>

                  <Text variant="subtitle1" component="span">
                    {t('workspaceModal.description')}
                  </Text>
                </span>
              ),
              component: <EditWorkspaceNameForm />,
            });
          }}
        >
          {t('labels.createWorkspace')}
        </Button>
      </section>

      <section className="grid grid-flow-row gap-2">
        <Text color="secondary">{t('common:labels.resources')}</Text>

        <div className="grid grid-flow-row gap-2">
          <Resource
            text={t('labels.documentation')}
            logo="Question"
            link="https://docs.nhost.io"
          />
          <Resource
            text={t('labels.client')}
            logo="js"
            link="https://docs.nhost.io/reference/javascript/"
          />
          <Resource
            text={t('labels.cli')}
            logo="CLI"
            link="https://docs.nhost.io/platform/cli"
          />
        </div>
      </section>

      <section className="grid grid-flow-row gap-2">
        <NavLink
          href="https://github.com/nhost/nhost"
          passHref
          target="_blank"
          rel="noreferrer noopener"
        >
          <Button
            className="grid grid-flow-col gap-1"
            variant="outlined"
            color="secondary"
            startIcon={<GithubIcon />}
          >
            {t('common:labels.starUs')}
          </Button>
        </NavLink>

        <NavLink
          href="https://discord.com/invite/9V7Qb2U"
          passHref
          target="_blank"
          rel="noreferrer noopener"
        >
          <Button
            className="grid grid-flow-col gap-1"
            variant="outlined"
            color="secondary"
            aria-labelledby="discord-button-label"
          >
            <Image
              src="/assets/brands/discord.svg"
              alt="Discord Logo"
              width={24}
              height={24}
            />

            <span id="discord-button-label">
              {t('common:labels.joinDiscord')}
            </span>
          </Button>
        </NavLink>
      </section>
    </Box>
  );
}
