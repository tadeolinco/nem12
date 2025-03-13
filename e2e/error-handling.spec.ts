import { expect, test } from "@playwright/test";
import fs from "fs";
import path from "path";

// Extend the Window interface to include our custom properties
declare global {
  interface Window {
    toastMessages: Array<{ type: string; message: string }>;
    toast: {
      error: (message: string) => void;
      [key: string]: unknown;
    };
  }
}

test.describe("NEM12 Parser Error Handling", () => {
  test("should show error for invalid file format", async ({ page }) => {
    // Create an invalid CSV file
    const invalidFilePath = path.join(__dirname, "fixtures", "invalid.csv");

    await page.goto("/");

    // Get the file input element
    const fileInput = page.locator('input[type="file"]');

    // Upload the invalid file
    await fileInput.setInputFiles(invalidFilePath);

    await expect(
      page.locator("text=Invalid MDFF data: Missing header block")
    ).toBeVisible();

    await expect(
      page.locator("text=Select a file or drag and drop to start processing")
    ).toBeVisible();
  });

  test("should show error for missing header block", async ({ page }) => {
    // Create a CSV file with missing header block
    const invalidFilePath = path.join(
      __dirname,
      "fixtures",
      "missing-header.csv"
    );
    fs.writeFileSync(
      invalidFilePath,
      "200,NMI123456789,E1,1,E1,N1,METER1,KWH,30,20220101\n300,20220101,10,20,30,40\n900"
    );

    await page.goto("/");

    // Get the file input element
    const fileInput = page.locator('input[type="file"]');

    // Upload the invalid file
    await fileInput.setInputFiles(invalidFilePath);

    // Wait for the error toast to appear

    await expect(
      page.locator("text=Invalid MDFF data: Missing header block")
    ).toBeVisible();

    // Clean up
    fs.unlinkSync(invalidFilePath);
  });
});
