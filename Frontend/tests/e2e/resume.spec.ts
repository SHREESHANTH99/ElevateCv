import { test, expect } from '@playwright/test';

test.describe('ElevateCV User Journey: Resume Lifecycle', () => {
  test('should create, edit, and delete a resume with dashboard updates', async ({ page }) => {
    // 1. Setup API Mocking (Backend-less testing)
    const mockResumes: any[] = [];
    
    // Mock login/auth state by setting localStorage
    await page.addInitScript(() => {
      localStorage.setItem('authToken', 'fake-token-for-testing');
      localStorage.setItem('user', JSON.stringify({ email: 'test@example.com', uid: 'test-user-1' }));
    });

    // Mock GET /api/resume (Dashboard/Profile uses this)
    await page.route('**/api/resume', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ resumes: mockResumes }),
        });
      } else if (route.request().method() === 'POST') {
        // Mock Create
        const postData = JSON.parse(route.request().postData() || '{}');
        const newResume = { 
          ...postData, 
          _id: 'mock-id-123', 
          id: 'mock-id-123',
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        };
        mockResumes.push(newResume);
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: newResume, resume: newResume }),
        });
      } else if (route.request().method() === 'PUT') {
        // Mock Update
        const putData = JSON.parse(route.request().postData() || '{}');
        const index = mockResumes.findIndex(r => r._id === putData._id || r.id === putData._id);
        if (index > -1) {
          mockResumes[index] = { ...mockResumes[index], ...putData, updatedAt: new Date().toISOString() };
        }
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: mockResumes[index] }),
        });
      }
    });

    // Mock GET /api/resume/:id (Builder uses this to load a specific resume)
    await page.route('**/api/resume/mock-id-123', async (route) => {
      if (route.request().method() === 'GET') {
        const resume = mockResumes.find(r => r._id === 'mock-id-123');
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: resume }),
        });
      } else if (route.request().method() === 'DELETE') {
        // Mock Delete
        const index = mockResumes.findIndex(r => r._id === 'mock-id-123');
        if (index > -1) mockResumes.splice(index, 1);
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Deleted successfully' }),
        });
      }
    });

    // Mock AI Analysis to avoid third-party calls during test
    await page.route('**/api/ai/analyze-resume', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ score: 85, label: 'Strong Match' }),
      });
    });

    // 2. Start Journey at Dashboard
    await page.goto('/dashboard');
    
    // 3. Navigate to Create Resume (Builder)
    // Depending on UI, there should be a 'Create New Resume' or 'Build Resume' button
    await page.goto('/builder'); // Direct navigation since button selectors vary

    // 4. Fill out Resume
    // Wait for the form to appear
    await page.waitForSelector('input[placeholder="Untitled Resume"]');
    
    // Set a title
    await page.fill('input[placeholder="Untitled Resume"]', 'E2E Test Resume');
    
    // Fill out Personal Info
    await page.fill('input[placeholder="e.g. John Doe"]', 'Jane Tester');
    await page.fill('input[placeholder="e.g. john@example.com"]', 'jane@example.com');
    await page.fill('input[placeholder="e.g. +1 234 567 890"]', '+1 555 1234');
    
    // Add Summary
    await page.click('text=Summary'); // Expand section if needed
    await page.fill('textarea', 'A passionate software engineer specializing in automated testing.');

    // Add Experience
    await page.click('text=Experience');
    await page.click('button:has-text("Add Experience")');
    await page.fill('input[placeholder="e.g. Google"]', 'TestCorp');
    await page.fill('input[placeholder="e.g. Software Engineer"]', 'QA Engineer');

    // Add Education
    await page.click('text=Education');
    await page.click('button:has-text("Add Education")');
    await page.fill('input[placeholder="e.g. Stanford University"]', 'Test University');
    await page.fill('input[placeholder="e.g. Bachelor of Science"]', 'B.S. Computer Science');

    // Add Skills
    await page.click('text=Skills');
    await page.click('button:has-text("Add Skill")');
    await page.fill('input[placeholder="e.g. React"]', 'Playwright');

    // 5. Save Resume
    await page.click('button:has-text("Save")');
    
    // Wait for saving to complete (button text changes or toast appears)
    await expect(page.locator('button:has-text("Saved")')).toBeVisible({ timeout: 5000 });

    // 6. Return to Dashboard and verify it appears
    await page.goto('/dashboard');
    await expect(page.locator('text=E2E Test Resume')).toBeVisible();

    // 7. Open/Edit the resume
    // Click the edit button on the resume card (assuming there's an edit link/button)
    // We'll navigate directly using the mocked ID for robustness
    await page.goto('/builder?resumeId=mock-id-123');

    // 8. Update Resume
    await page.waitForSelector('input[placeholder="Untitled Resume"]');
    await page.fill('input[placeholder="Untitled Resume"]', 'E2E Updated Resume');
    await page.click('button:has-text("Save")');
    await expect(page.locator('button:has-text("Saved")')).toBeVisible({ timeout: 5000 });

    // 9. Dashboard reflects update
    await page.goto('/dashboard');
    await expect(page.locator('text=E2E Updated Resume')).toBeVisible();
    await expect(page.locator('text=E2E Test Resume')).not.toBeVisible();

    // 10. Delete Resume
    // Go to Profile page which has delete functionality based on our migration
    await page.goto('/profile');
    
    // Accept the window.confirm dialog automatically
    page.on('dialog', dialog => dialog.accept());
    
    // Click delete button
    // Find the resume card and click its delete button (assuming a Trash icon or 'Delete' text)
    // We'll locate the trash icon button within the resume's container
    const deleteButton = page.locator('button').filter({ has: page.locator('svg.lucide-trash2') }).first();
    await deleteButton.click();

    // 11. Resume disappears
    await expect(page.locator('text=E2E Updated Resume')).not.toBeVisible();
  });
});
