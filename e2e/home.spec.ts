import { expect, test } from "@playwright/test";
import path from "path";

test.describe("NEM12 Parser Application", () => {
  test("should display the home page correctly", async ({ page }) => {
    await page.goto("/");

    // Check if the title is displayed
    await expect(page.locator("text=NEM12 CSV Parser")).toBeVisible();

    // Check if the file upload area is displayed
    await expect(
      page.locator("text=Select a file or drag and drop to start processing"),
    ).toBeVisible();
  });

  test("should upload and process a NEM12 file", async ({ page }) => {
    await page.goto("/");

    // Get the file input element
    const fileInput = page.locator('input[type="file"]');

    // Upload the sample file
    const filePath = path.join(__dirname, "fixtures", "sample.csv");
    await fileInput.setInputFiles(filePath);

    await page.waitForSelector("text=Charts", {
      state: "visible",
      timeout: 30000,
    });

    // Check if the summary is displayed
    await expect(page.locator("text=Total Consumption")).toBeVisible();

    // Check if the chart is displayed
    await expect(page.locator("text=Charts")).toBeVisible();

    // Check if the SQL tab is available
    await page.click("text=SQL statements");
    await expect(page.locator("text=Copy to clipboard")).toBeVisible();
  });

  test("should allow uploading a new file", async ({ page }) => {
    await page.goto("/");

    // Upload the sample file first
    const fileInput = page.locator('input[type="file"]');
    const filePath = path.join(__dirname, "fixtures", "sample.csv");
    await fileInput.setInputFiles(filePath);

    // Wait for processing to complete
    await page.waitForSelector("text=Charts", {
      state: "visible",
      timeout: 30000,
    });

    // Click on "Upload new file" button
    await page.click("text=Upload new file");

    // Check if we can upload again
    await fileInput.setInputFiles(filePath);

    // Wait for processing to complete again
    await page.waitForSelector("text=Charts", {
      state: "visible",
      timeout: 30000,
    });

    // Verify that the data is displayed again
    await expect(page.locator("text=Total Consumption")).toBeVisible();
  });
});
