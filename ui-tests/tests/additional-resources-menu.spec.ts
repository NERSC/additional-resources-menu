import { test, expect } from '@jupyterlab/galata';

test.use({
  autoGoto: false
});

test.describe('Additional Resources Menu Extension', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/lab');
    await page.waitForSelector('#jp-main-dock-panel');
  });

  test('should render the Help menu in the menu bar', async ({ page }) => {
    const helpMenu = page.locator('.lm-MenuBar-itemLabel:text("Help")');
    await expect(helpMenu).toBeVisible();
  });

  test('should display Additional Resources in the Help menu when links are configured', async ({
    page
  }) => {
    // Dynamically set links
    await page.evaluate(async () => {
      const app = (window as any).jupyterapp;
      if (app?.serviceManager?.settings) {
        await app.serviceManager.settings.set(
          'additional-resources-menu:plugin',
          {
            'menu-title': 'Additional Resources',
            links: [
              { name: 'NERSC Documentation', url: 'https://docs.nersc.gov' }
            ]
          }
        );
      }
    });

    await page.waitForTimeout(500);

    // Click Help to open the menu
    await page.locator('.lm-MenuBar-itemLabel:text("Help")').click();

    const submenuItem = page.locator(
      '.lm-Menu-itemLabel:text("Additional Resources")'
    );
    await expect(submenuItem).toBeVisible();

    await submenuItem.hover();
    await expect(
      page.locator('.lm-Menu-itemLabel:text("NERSC Documentation")')
    ).toBeVisible();
  });

  test('should update menu items dynamically when settings change', async ({
    page
  }) => {
    await page.evaluate(async () => {
      const app = (window as any).jupyterapp;
      if (app?.serviceManager?.settings) {
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

    await page.waitForTimeout(500);

    // Open Help menu
    await page.locator('.lm-MenuBar-itemLabel:text("Help")').click();

    const dynamicSubmenu = page.locator(
      '.lm-Menu-itemLabel:text("Dynamic Resources")'
    );
    await expect(dynamicSubmenu).toBeVisible();

    await dynamicSubmenu.hover();
    await expect(
      page.locator('.lm-Menu-itemLabel:text("Test Link 1")')
    ).toBeVisible();
    await expect(
      page.locator('.lm-Menu-itemLabel:text("Test Link 2")')
    ).toBeVisible();
  });
});
