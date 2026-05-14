import { test, expect, Page } from '@playwright/test'

async function loginViaUI(page: Page) {
  await page.goto('/login')
  await page.getByTestId('email-input').fill('test@example.com')
  await page.getByTestId('password-input').fill('password123')
  await page.getByTestId('submit-button').click()
  await page.waitForURL('/posts')
}

async function createPost(page: Page, title = '댓글 테스트 게시글', content = '내용') {
  const res = await page.request.post('/api/posts', { data: { title, content } })
  return res.json()
}

test.describe('Comments', () => {
  test.beforeEach(async ({ page }) => {
    await loginViaUI(page)
    const res = await page.request.get('/api/posts')
    const posts = await res.json()
    for (const post of posts) {
      await page.request.delete(`/api/posts/${post.id}`)
    }
  })

  test('로그인 사용자가 댓글을 등록한다', async ({ page }) => {
    const post = await createPost(page)
    await page.goto(`/posts/${post.id}`)

    await page.getByTestId('comment-input').fill('첫 번째 댓글')
    await page.getByTestId('comment-submit').click()

    await expect(page.getByTestId('comment-item').first()).toContainText('첫 번째 댓글')
  })

  test('댓글 목록에 작성자 이름이 표시된다', async ({ page }) => {
    const post = await createPost(page)
    await page.request.post(`/api/posts/${post.id}/comments`, {
      data: { content: '작성자 표시 테스트' },
    })

    await page.goto(`/posts/${post.id}`)
    const item = page.getByTestId('comment-item').first()
    await expect(item.getByTestId('comment-author')).toContainText('테스트유저')
  })

  test('댓글 작성자는 삭제할 수 있다', async ({ page }) => {
    const post = await createPost(page)
    await page.goto(`/posts/${post.id}`)

    await page.getByTestId('comment-input').fill('삭제될 댓글')
    await page.getByTestId('comment-submit').click()
    await expect(page.getByTestId('comment-item')).toHaveCount(1)

    page.once('dialog', (dialog) => dialog.accept())
    await page.getByTestId('comment-delete').first().click()

    await expect(page.getByTestId('comment-item')).toHaveCount(0)
  })

  test('비로그인 사용자에게 댓글 입력 폼이 보이지 않는다', async ({ page }) => {
    const post = await createPost(page)

    await page.context().clearCookies()
    await page.goto(`/posts/${post.id}`)

    await expect(page.getByTestId('post-title')).toBeVisible()
    await expect(page.getByTestId('comment-form')).not.toBeVisible()
  })
})
