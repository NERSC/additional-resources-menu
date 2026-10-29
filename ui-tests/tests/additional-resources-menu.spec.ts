import { test, expect } from '@jupyterlab/galata';

test.describe('Additional Resources Menu Extension', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto();
    // Wait for the JupyterLab shell to be ready
    await page.waitForSelector('#jp-main-dock-panel');
  });

  test('should render the Help menu in the menu bar', async ({ page }) => {
    const helpMenu = page.locator('.lm-MenuBar-itemLabel:text("Help")');
    await expect(helpMenu).toBeVisible();
  });

  test('should display Additional Resources in the Help menu', async ({
    page
  }) => {
    await page.menu.open('Help');

    const submenuItem = page.locator(
      '.lm-Menu-itemLabel:text("Additional Resources")'
    );
    await expect(submenuItem).toBeVisible();
  });

  test('should update menu items dynamically when settings change', async ({
    page
  }) => {
    // Dynamically update plugin settings via JupyterLab serviceManager
    await page.evaluate(async () => {
      const app = (window as any).jupyterapp;
      if (app && app.serviceManager && app.serviceManager.settings) {
        await app.serviceManager.settings.set(
          'additional-resources-menu:plugin',
          {
            'menu-title': 'Dynamic Resources',
            links: [
              { name: 'Test Link 1', url: 'https://example.com/1' },
              { name: 'Test Link 2', url: 'https://example.com/2' }
            ]
          }
        );
      }
    });

    // Open the Help menu and verify the new title
    await page.menu.open('Help');
    const dynamicSubmenu = page.locator(
      '.lm-Menu-itemLabel:text("Dynamic Resources")'
    );
    await expect(dynamicSubmenu).toBeVisible();

    // Hover over the submenu to open it
    await dynamicSubmenu.hover();

    const link1 = page.locator('.lm-Menu-itemLabel:text("Test Link 1")');
    await expect(link1).toBeVisible();

    const link2 = page.locator('.lm-Menu-itemLabel:text("Test Link 2")');
    await expect(link2).toBeVisible();
  });
});
