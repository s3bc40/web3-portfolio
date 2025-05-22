import { test, expect } from '@playwright/test';

/**
 * This test suite is designed to verify the functionality and layout of the landing page of the application.
 * @dev maybe export consts in components and use them here
 */

test('should navigate to the home page and have the correct title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('s3bc40 portfolio');
});

test('should display the navbar with connect button', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('nav')).toBeVisible();
  await expect(page.getByTestId("rk-connect-button")).toBeVisible();
});

test('should display the profile section with correct information', async ({ page }) => {
  await page.goto('/');
  const profileLocator = page.getByTestId('profile');
  await expect(profileLocator).toBeVisible();
  // Check for specific text in the ProfileSection
  await expect(profileLocator.getByText('s3bc40')).toBeVisible();
  await expect(profileLocator.getByText('Smart Contract Developer & Security Researcher')).toBeVisible();
  await expect(profileLocator.getByText('Your open-source developer and security researcher, specializing in smart contracts and blockchain')).toBeVisible();
  await expect(profileLocator.getByAltText("Avatar")).toBeVisible();
});

test('should display the about section with correct titles and descriptions', async ({ page }) => {
  await page.goto('/');
  const aboutLocator = page.getByTestId('about');
  await expect(aboutLocator).toBeVisible();
  // Check for specific titles and descriptions in the AboutSection
  const aboutItems = [
    { title: 'Who am I?', description: 'I am a developer with a focus on smart contracts' },
    { title: 'What do I do?', description: 'I specialize in smart contract development, security audits,' },
    { title: 'How do I work?', description: 'I follow best practices in software development, including' },
    { title: 'Why choose me?', description: 'I am dedicated to delivering high-quality work and ensuring' },
  ];
  for (const item of aboutItems) {
    await expect(aboutLocator.getByText(item.title)).toBeVisible();
    await expect(aboutLocator.getByText(item.description)).toBeVisible();
  }
});

test('should display the tech-stack section', async ({ page }) => {
  await page.goto('/');
  const techStackLocator = page.getByTestId('tech-stack');
  await expect(techStackLocator).toBeVisible();
});

test('should display the Cyfrin Updraft courses section with correct links', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('course')).toBeVisible();

  // Check for specific course certifications and their links
  const intermediateCourseLink = page.getByAltText("Intermediate Python and Vyper");
  await expect(intermediateCourseLink).toBeVisible();

  const advancedCourseLink = page.getByAltText("Advanced Python and Vyper Smart Contract Development");
  await expect(advancedCourseLink).toBeVisible();

  const fullStackCourseLink = page.getByAltText("Full-Stack Web3 Development Crash Course");
  await expect(fullStackCourseLink).toBeVisible();
});