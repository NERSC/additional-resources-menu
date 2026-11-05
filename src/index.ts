import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  ILabShell,
  ILayoutRestorer
} from '@jupyterlab/application';
import { MainAreaWidget, WidgetTracker } from '@jupyterlab/apputils';
import { URLExt } from '@jupyterlab/coreutils';
import { IMainMenu } from '@jupyterlab/mainmenu';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { ITranslator } from '@jupyterlab/translation';
import { IFrame } from '@jupyterlab/ui-components';
import { IDisposable } from '@lumino/disposable';
import { Menu } from '@lumino/widgets';

export const PLUGIN_ID = 'additional-resources-menu:plugin';
export const CSS_CLASS = 'jp-additional-resources-menu';
export const OPEN_COMMAND = 'additional-resources-menu:open';

export interface IResourceLink {
  name: string;
  url: string;
}

/**
 * Filter raw items from settings to ensure each has valid name and parseable URL.
 */
export function filterValidLinks(
  rawLinks: unknown[],
  translator?: (str: string) => string
): IResourceLink[] {
  if (!Array.isArray(rawLinks)) {
    return [];
  }
  const trans = translator ?? (s => s);
  return rawLinks
    .filter((element): element is IResourceLink => {
      if (!element || typeof element !== 'object') {
        return false;
      }
      const item = element as Record<string, unknown>;
      if (typeof item.url !== 'string' || typeof item.name !== 'string') {
        return false;
      }
      try {
        URLExt.parse(item.url);
        return true;
      } catch (e) {
        console.error(`Error parsing URL: ${item.url}`);
        return false;
      }
    })
    .map(element => ({
      name: trans(element.name),
      url: element.url
    }));
}

/**
 * Check whether opening a URL in an iframe would result in mixed-content blocking.
 */
export function isMixedContent(url: string, currentProtocol?: string): boolean {
  const protocol =
    currentProtocol ??
    (typeof window !== 'undefined' ? window.location.protocol : 'http:');
  return protocol === 'https:' && URLExt.parse(url).protocol !== 'https:';
}

/**
 * Create a new tab widget containing an iframe.
 */
export function newHelpResourceWidget(
  name: string,
  url: string,
  namespace: string,
  tabId: number
): MainAreaWidget<IFrame> {
  const content = new IFrame({
    sandbox: [
      'allow-scripts',
      'allow-same-origin',
      'allow-forms',
      'allow-popups',
      'allow-downloads'
    ]
  });
  content.url = url;
  content.addClass(CSS_CLASS);
  content.title.label = name;
  content.id = `${namespace}-${tabId}`;
  const widget = new MainAreaWidget({ content });
  widget.addClass(CSS_CLASS);
  return widget;
}

/**
 * Initialization data for the help-menu extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: PLUGIN_ID,
  autoStart: true,
  requires: [IMainMenu, ISettingRegistry, ITranslator],
  optional: [ILabShell, ILayoutRestorer],
  activate: (
    app: JupyterFrontEnd,
    mainMenu: IMainMenu,
    settingRegistry: ISettingRegistry,
    translator: ITranslator,
    labShell: ILabShell | null,
    restorer: ILayoutRestorer | null
  ) => {
    console.log(`JupyterLab extension ${PLUGIN_ID} is activated!`);

    const { commands, shell } = app;
    const additionalResourcesMenu: Menu = new Menu({ commands });
    const namespace = 'additional-resources-menu';
    const trans = translator.load('jupyterlab');
    const tracker = new WidgetTracker<MainAreaWidget<IFrame>>({ namespace });
    let links: IResourceLink[] = [];
    let openInJupyter = false;
    let tabs = 0;
    let rank = 10;
    let menuGroupDisposable: IDisposable | null = null;

    if (restorer) {
      // Restore any tracked iframe widgets
      void restorer.restore(tracker, {
        command: OPEN_COMMAND,
        args: widget => ({
          name: widget.title.label,
          url: widget.content.url
        }),
        name: () => namespace
      });
    }

    function updateMenuItems(): void {
      additionalResourcesMenu.clearItems();
      links.forEach(element => {
        additionalResourcesMenu.addItem({
          command: OPEN_COMMAND,
          args: element as any
        });
      });
    }

    function attachSubmenu(targetRank: number): void {
      if (menuGroupDisposable) {
        menuGroupDisposable.dispose();
        menuGroupDisposable = null;
      }
      if (links.length === 0) {
        return;
      }
      menuGroupDisposable = mainMenu.helpMenu.addGroup(
        [
          {
            type: 'submenu' as Menu.ItemType,
            submenu: additionalResourcesMenu
          }
        ],
        targetRank
      );
    }

    function loadSetting(setting: ISettingRegistry.ISettings): void {
      const rawLinks = setting.get('links').composite;
      links = filterValidLinks(rawLinks as unknown[], (s: string) =>
        trans.__(s)
      );

      const title = setting.get('menu-title').composite as string;
      additionalResourcesMenu.title.label = title || 'Additional Resources';

      openInJupyter = setting.get('open-in-jupyter').composite as boolean;

      const newRank = (setting.get('rank').composite as number) ?? 10;
      rank = newRank;

      updateMenuItems();
      attachSubmenu(rank);
    }

    commands.addCommand(OPEN_COMMAND, {
      label: args => (args['name'] as string) || '',
      caption: args => (args['name'] as string) || '',
      execute: args => {
        const name = (args['name'] as string) || '';
        const url = (args['url'] as string) || '';
        if (!url) {
          return;
        }

        const mixed = isMixedContent(url);
        if (openInJupyter && !mixed) {
          // Activate existing tab if already open for this URL
          let existingWidget: MainAreaWidget<IFrame> | undefined;
          tracker.forEach(w => {
            if (w.content.url === url) {
              existingWidget = w;
            }
          });

          if (existingWidget) {
            shell.activateById(existingWidget.id);
            return existingWidget;
          }

          const widget = newHelpResourceWidget(name, url, namespace, tabs);
          tabs += 1;
          void tracker.add(widget);
          shell.add(widget, 'main');
          return widget;
        } else {
          window.open(url, '_blank', 'noopener,noreferrer');
        }
      }
    });

    Promise.all([settingRegistry.load(PLUGIN_ID), app.restored])
      .then(([setting]) => {
        if (setting) {
          loadSetting(setting);
          setting.changed.connect(loadSetting);
          attachSubmenu(rank);
        }
      })
      .catch(error => {
        console.error(`${PLUGIN_ID} Failed to load settings:`, error);
      });
  }
};

export default extension;
