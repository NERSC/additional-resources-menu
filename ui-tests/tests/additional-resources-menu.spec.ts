import { test, expect } from '@jupyterlab/galata';

/**
 * Don't load JupyterLab webpage before running the tests.
 * This is required to ensure we capture all log messages.
 */
test.use({ autoGoto: false });

test.describe('Additional Resources Menu Extension', () => {
  test('should emit an activation console message', async ({ page }) => {
    const logs: string[] = [];

    page.on('console', message => {
      logs.push(message.text());
    });

    await page.goto();

    expect(
      logs.filter(
        s =>
          s ===
          'JupyterLab extension additional-resources-menu:plugin is activated!'
      )
    ).toHaveLength(1);
  });

  test('should render the Help menu in the menu bar', async ({ page }) => {
    await page.goto();
    const helpMenu = page.locator('.lm-MenuBar-itemLabel:text("Help")');
    await expect(helpMenu).toBeVisible();
  });

  test('should display Additional Resources in the Help menu when links are configured', async ({
    page
  }) => {
    await page.goto();

    // Save settings via REST API
    await page.evaluate(async () => {
      const app = (window as any).jupyterapp;
      if (app?.serviceManager?.settings) {
        await app.serviceManager.settings.save(
          'additional-resources-menu:plugin',
          JSON.stringify({
            'menu-title': 'Additional Resources',
            links: [
              { name: 'NERSC Documentation', url: 'https://docs.nersc.gov' }
            ]
          })
        );
      }
    });

    // Reload page so settings are loaded at startup
    await page.reload();

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
    await page.goto();

    // Save initial links and reload
    await page.evaluate(async () => {
      const app = (window as any).jupyterapp;
      if (app?.serviceManager?.settings) {
        await app.serviceManager.settings.save(
          'additional-resources-menu:plugin',
          JSON.stringify({
            'menu-title': 'Dynamic Resources',
            links: [
              { name: 'Test Link 1', url: 'https://example.com/1' },
              { name: 'Test Link 2', url: 'https://example.com/2' }
            ]
          })
        );
      }
    });

    await page.reload();

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
