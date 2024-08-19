const { test, expect } = require("@playwright/test");
const { json } = require("stream/consumers");

test.describe("Signup Flow Tests", () => {
  const email = `testUser${Math.floor(
    Math.random() * 100000 + 1
  )}@validcompany.com`;
  test.beforeEach(async ({ page }) => {
    // Navigate to the signup page
    await page.goto("https://app-moccona.letsweel.com/app/business-signup");
  });

  test("User should be able to sign up with valid email and password", async ({
    page,
  }) => {
    await page.fill('input[name="email"]', email);

    await page.click('button:has-text("Sign up with email")');

    // Check that the user is navigated to the /personal-info page
    await expect(page).toHaveURL(/.*\/business-signup/);
    const createAccount = page.locator("text=Create account");
    await expect(createAccount).toBeVisible();
    await expect(createAccount).toBeDisabled();

    //after filling valid password create account button should be enabled
    await page.fill('input[name="password"]', "ValidPassword123!");
    await page.locator("label").nth(2).click();
    await expect(createAccount).toBeEnabled();
    await page.getByTestId("email-sign-up").click();
    await page.waitForURL(/.*\/personal-info/);
    await page.getByTestId("input-first-name").fill("testFirstName");
    await page.getByTestId("input-last-name").fill("testLastName");
    await page.getByPlaceholder("345 678").fill("0460 934 566");
    await page.getByTestId("dob-day-input").getByTestId("ds-input").fill("14");
    await page
      .getByTestId("dob-month-input")
      .getByTestId("ds-input")
      .fill("05");
    await page
      .getByTestId("dob-year-input")
      .getByTestId("ds-input")
      .fill("1992");
    await page.getByTestId("next-button").click();

    await page.getByRole("button", { name: "Skip for now" }).click();
    await expect(page).toHaveURL(/.*\/business-info/);
    //logging out here because we do not know the ABN details. But if there is logout it means we were able to
    //sign Up succesfully
    await page.getByRole("button", { name: "logout" }).click();
    await expect(page).toHaveURL(/.*\/login/);
  });

  test("Error messages should show if email or password do not meet requirements", async ({
    page,
  }) => {
    await page.click('button:has-text("Sign up with email")');

    // Check for  email error messages on empty fields
    const emailError = page.locator("text=Please enter an email address.");
    await expect(emailError).toBeVisible();

    const newEmail = `testUserNew${Math.floor(
      Math.random() * 100000 + 1
    )}@validcompany.com`;
    await page.fill('input[name="email"]', newEmail);

    await page.click('button:has-text("Sign up with email")');
    // filling empty password
    await page.fill('input[name="password"]', "");
    await page.locator("label").nth(2).click();
    // await expect(
    //   page.getByTestId("ds-alert-brand-check-icon ds-check-circle-icon")
    // ).toHaveCount(4);
    await expect(
      page.getByTestId("ds-alert-error-icon ds-exclamation-circle-icon")
    ).toHaveCount(4);

    // adding 8 characters
    await page.fill('input[name="password"]', "passwordchar");
    await expect(
      page.getByTestId("ds-alert-error-icon ds-exclamation-circle-icon")
    ).toHaveCount(3);
    await expect(
      page.getByTestId("ds-alert-brand-check-icon ds-check-circle-icon")
    ).toHaveCount(1);

    // adding Upper and lower chars
    await page.fill('input[name="password"]', "Passwordchar");
    await expect(
      page.getByTestId("ds-alert-error-icon ds-exclamation-circle-icon")
    ).toHaveCount(2);
    await expect(
      page.getByTestId("ds-alert-brand-check-icon ds-check-circle-icon")
    ).toHaveCount(2);

    // adding special character
    await page.fill('input[name="password"]', "Passwordchar@");
    await expect(
      page.getByTestId("ds-alert-error-icon ds-exclamation-circle-icon")
    ).toHaveCount(1);
    await expect(
      page.getByTestId("ds-alert-brand-check-icon ds-check-circle-icon")
    ).toHaveCount(3);

    // adding numbers
    await page.fill('input[name="password"]', "ValidPassword123!");
    await expect(
      page.getByTestId("ds-alert-error-icon ds-exclamation-circle-icon")
    ).toHaveCount(0);
    await expect(
      page.getByTestId("ds-alert-brand-check-icon ds-check-circle-icon")
    ).toHaveCount(4);
  });

  test("Email field should only accept valid work emails", async ({ page }) => {
    await page.fill('input[name="email"]', "invalid-email");

    await page.click('button:has-text("Sign up with email")');

    //after filling valid password create account button should be enabled
    await page.fill('input[name="password"]', "ValidPassword123!");
    await page.locator("label").nth(2).click();

    await page.getByTestId("email-sign-up").click();

    // Check for error message on invalid email
    const emailError = page.locator(
      "text=Please try again with your work email address"
    );
    await expect(emailError).toBeVisible();
  });

  test("Should not be able to sign up with an already registered email", async ({
    page,
  }) => {
    // Attempt to sign up with an email that is already registered
    await page.fill('input[name="email"]', email);

    await page.click('button:has-text("Sign up with email")');

    //after filling valid password create account button should be enabled
    await page.fill('input[name="password"]', "ValidPassword123!");
    await page.locator("label").nth(2).click();

    await page.getByTestId("email-sign-up").click();

    // Check for error message for existing user
    const signUpError = page.locator("text=This account already exists");
    await expect(signUpError).toBeVisible();
  });

  test("Each field should show an error message if unpopulated", async ({
    page,
  }) => {
    // Check that the user is navigated to the /personal-info page
    const newTestEmail = `testUser12${Math.floor(
      Math.random() * 100000 + 1
    )}@validcompany.com`;
    await expect(page).toHaveURL(/.*\/business-signup/);

    await page.fill('input[name="email"]', newTestEmail);
    await page.click('button:has-text("Sign up with email")');
    await page.fill('input[name="password"]', "ValidPassword123!");
    await page.locator("label").nth(2).click();
    await page.getByTestId("email-sign-up").click();
    await page.waitForURL(/.*\/personal-info/);
    await page.getByTestId("input-first-name").fill("");
    await page.getByTestId("input-last-name").fill("");
    await page.getByPlaceholder("345 678").fill("");
    await page.getByTestId("dob-day-input").getByTestId("ds-input").fill("");
    await page.getByTestId("dob-month-input").getByTestId("ds-input").fill("");
    await page.getByTestId("dob-year-input").getByTestId("ds-input").fill("");

    // Check for error message personal info page
    const firstNameError = page.locator("text=Please enter your first name");
    await expect(firstNameError).toBeVisible();
    const lastNameError = page.locator("text=Please enter your last name");
    await expect(lastNameError).toBeVisible();
    const MobileNumberError = page.locator(
      "text=Please enter your mobile number"
    );
    await expect(MobileNumberError).toBeVisible();
    const dobError = page.locator("text=Please enter a valid date of birth");
    await expect(dobError).toBeVisible();
  });
});
