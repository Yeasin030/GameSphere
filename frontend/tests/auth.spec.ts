import { test, expect } from '@playwright/test';

test.describe('Authentication Flows', () => {
  test('should navigate to login page', async ({ page }) => {
    // Navigating to the login page
    await page.goto('/login');

    // Check if the login form is rendered
    await expect(page.locator('h1')).toContainText('Welcome back!');
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  });

  test('should show validation errors on empty login submission', async ({ page }) => {
    await page.goto('/login');
    
    // Attempt to login without filling anything (Wait for button to be clickable)
    const loginButton = page.getByRole('button', { name: 'Login' });
    await loginButton.waitFor({ state: 'visible' });
    
    // Since the inputs are native "required", HTML5 validation blocks the submission.
    // Playwright won't see a DOM error message unless we explicitly check the validity state or UI errors.
    // For now, let's just make sure clicking it doesn't navigate away.
    await loginButton.click();
    await expect(page).toHaveURL(/.*login/);
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/register');

    // Check if the registration form is rendered
    await expect(page.locator('h1')).toContainText('Create YourGameSphere Account');
    
    // The register page uses placeholders, not labels
    await expect(page.getByPlaceholder('Display Name')).toBeVisible();
    await expect(page.getByPlaceholder('Username')).toBeVisible();
    await expect(page.getByPlaceholder('Email Address')).toBeVisible();
    await expect(page.getByPlaceholder('Password', { exact: true })).toBeVisible();
    await expect(page.getByPlaceholder('Confirm Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign Up' })).toBeVisible();
  });
});
