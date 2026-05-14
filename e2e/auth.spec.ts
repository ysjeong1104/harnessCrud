import { test, expect } from '@playwright/test'

test.describe('Auth', () => {
  test('새 사용자를 등록한다', async ({ page }) => {
    await page.goto('/register')
    await page.getByTestId('name-input').fill('신규유저')
    await page.getByTestId('email-input').fill('new@example.com')
    await page.getByTestId('password-input').fill('password123')
    await page.getByTestId('submit-button').click()

    await page.waitForURL('/login')
  })

  test('올바른 자격증명으로 로그인한다', async ({ page }) => {
    await page.goto('/login')
    await page.getByTestId('email-input').fill('test@example.com')
    await page.getByTestId('password-input').fill('password123')
    await page.getByTestId('submit-button').click()

    await page.waitForURL('/posts')
    await expect(page.getByTestId('nav-user-name')).toHaveText('테스트유저')
  })

  test('잘못된 비밀번호로 로그인 실패한다', async ({ page }) => {
    await page.goto('/login')
    await page.getByTestId('email-input').fill('test@example.com')
    await page.getByTestId('password-input').fill('wrongpassword')
    await page.getByTestId('submit-button').click()

    await expect(page.getByTestId('error-message')).toBeVisible()
    expect(page.url()).toContain('/login')
  })

  test('로그아웃한다', async ({ page }) => {
    await page.goto('/login')
    await page.getByTestId('email-input').fill('test@example.com')
    await page.getByTestId('password-input').fill('password123')
    await page.getByTestId('submit-button').click()
    await page.waitForURL('/posts')

    await page.getByTestId('logout-button').click()
    await page.waitForURL('/login')
    await expect(page.getByTestId('login-link')).toBeVisible()
  })

  test('사용자 이름을 수정한다', async ({ page }) => {
    await page.request.post('/api/auth/register', {
      data: { user_name: '수정전이름', user_email: 'nameupdate@example.com', user_pass: 'password123' },
    })

    await page.goto('/login')
    await page.getByTestId('email-input').fill('nameupdate@example.com')
    await page.getByTestId('password-input').fill('password123')
    await page.getByTestId('submit-button').click()
    await page.waitForURL('/posts')

    await page.goto('/profile')
    await page.getByTestId('name-input').fill('수정후이름')
    await page.getByTestId('update-name-button').click()

    await expect(page.getByTestId('name-success')).toBeVisible()
    await page.reload()
    await expect(page.getByTestId('nav-user-name')).toHaveText('수정후이름')
  })

  test('비밀번호를 변경하고 새 비밀번호로 로그인한다', async ({ page }) => {
    await page.request.post('/api/auth/register', {
      data: { user_name: '패스테스트', user_email: 'passupdate@example.com', user_pass: 'oldpassword' },
    })

    await page.goto('/login')
    await page.getByTestId('email-input').fill('passupdate@example.com')
    await page.getByTestId('password-input').fill('oldpassword')
    await page.getByTestId('submit-button').click()
    await page.waitForURL('/posts')

    await page.goto('/profile')
    await page.getByTestId('current-pass-input').fill('oldpassword')
    await page.getByTestId('new-pass-input').fill('newpassword123')
    await page.getByTestId('update-pass-button').click()

    await expect(page.getByTestId('pass-success')).toBeVisible()

    await page.getByTestId('logout-button').click()
    await page.waitForURL('/login')

    await page.getByTestId('email-input').fill('passupdate@example.com')
    await page.getByTestId('password-input').fill('newpassword123')
    await page.getByTestId('submit-button').click()
    await page.waitForURL('/posts')
  })
})
