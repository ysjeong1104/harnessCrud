import { test, expect, Page } from '@playwright/test'

async function loginViaUI(page: Page, email = 'test@example.com', password = 'password123') {
  await page.goto('/login')
  await page.getByTestId('email-input').fill(email)
  await page.getByTestId('password-input').fill(password)
  await page.getByTestId('submit-button').click()
  await page.waitForURL('/posts')
}

test.describe('Posts CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await loginViaUI(page)

    const res = await page.request.get('/api/posts')
    const posts = await res.json()
    for (const post of posts) {
      await page.request.delete(`/api/posts/${post.id}`)
    }
  })

  test('빈 상태 메시지를 표시한다', async ({ page }) => {
    await page.goto('/posts')
    await expect(page.getByTestId('empty-state')).toBeVisible()
  })

  test('새 게시글을 등록하고 작성자 이름이 표시된다', async ({ page }) => {
    await page.goto('/posts')
    await page.getByTestId('new-post-link').click()

    await page.getByTestId('title-input').fill('E2E 테스트 게시글')
    await page.getByTestId('content-input').fill('E2E 테스트 내용입니다.')
    await page.getByTestId('submit-button').click()

    await page.waitForURL('/posts')
    const postItem = page.getByTestId('post-item').first()
    await expect(postItem.getByText('E2E 테스트 게시글')).toBeVisible()
    await expect(postItem.getByTestId('post-author')).toContainText('테스트유저')
  })

  test('게시글 상세 페이지에서 작성자를 확인한다', async ({ page }) => {
    const res = await page.request.post('/api/posts', {
      data: { title: '상세 보기 게시글', content: '상세 보기 내용' },
    })
    const post = await res.json()

    await page.goto(`/posts/${post.id}`)
    await expect(page.getByTestId('post-title')).toHaveText('상세 보기 게시글')
    await expect(page.getByTestId('post-content')).toHaveText('상세 보기 내용')
    await expect(page.getByTestId('post-author')).toContainText('테스트유저')
  })

  test('작성자는 게시글을 수정할 수 있다', async ({ page }) => {
    const res = await page.request.post('/api/posts', {
      data: { title: '수정 전 제목', content: '수정 전 내용' },
    })
    const post = await res.json()

    await page.goto(`/posts/${post.id}`)
    await page.getByTestId('edit-link').click()

    await page.getByTestId('title-input').fill('수정 후 제목')
    await page.getByTestId('content-input').fill('수정 후 내용')
    await page.getByTestId('submit-button').click()

    await page.waitForURL(`/posts/${post.id}`)
    await expect(page.getByTestId('post-title')).toHaveText('수정 후 제목')
  })

  test('작성자는 게시글을 삭제할 수 있다', async ({ page }) => {
    const res = await page.request.post('/api/posts', {
      data: { title: '삭제할 게시글', content: '삭제될 내용' },
    })
    const post = await res.json()

    await page.goto(`/posts/${post.id}`)
    page.once('dialog', (dialog) => dialog.accept())
    await page.getByTestId('delete-button').click()

    await page.waitForURL('/posts')
    await expect(page.getByText('삭제할 게시글')).not.toBeVisible()
  })

  test('비로그인 사용자에게는 수정/삭제 버튼이 보이지 않는다', async ({ page }) => {
    const res = await page.request.post('/api/posts', {
      data: { title: '권한 테스트 게시글', content: '권한 테스트 내용' },
    })
    const post = await res.json()

    await page.context().clearCookies()
    await page.goto(`/posts/${post.id}`)

    await expect(page.getByTestId('post-title')).toBeVisible()
    await expect(page.getByTestId('edit-link')).not.toBeVisible()
    await expect(page.getByTestId('delete-button')).not.toBeVisible()
  })

  test('목록에서 게시글 링크로 상세 페이지에 이동한다', async ({ page }) => {
    await page.request.post('/api/posts', {
      data: { title: '링크 테스트 게시글', content: '링크 테스트 내용' },
    })

    await page.goto('/posts')
    await page.getByTestId('post-item').getByText('링크 테스트 게시글').click()

    await expect(page.getByTestId('post-title')).toHaveText('링크 테스트 게시글')
  })
})
