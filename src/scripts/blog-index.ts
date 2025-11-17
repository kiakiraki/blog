document.addEventListener('DOMContentLoaded', () => {
  const filterButtons = document.querySelectorAll('.category-filter-btn');
  const postCards = document.querySelectorAll('.post-card');
  const noPostsMessage = document.getElementById('no-posts-message');
  const pageTitle = document.getElementById('page-title');

  // URLパラメータから初期カテゴリを取得
  const urlParams = new URLSearchParams(window.location.search);
  const initialCategory = urlParams.get('category');

  if (initialCategory) {
    filterPosts(initialCategory);
    updateActiveButton(initialCategory);
    updatePageTitle(initialCategory);
  }

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const category = button.getAttribute('data-category');
      filterPosts(category);
      updateActiveButton(category);
      updatePageTitle(category);
      updateURL(category);
    });
  });

  function filterPosts(category: string | null) {
    let visibleCount = 0;

    postCards.forEach(card => {
      const htmlCard = card as HTMLElement;
      const postCategory = card.getAttribute('data-category');

      if (!category || category === '' || postCategory === category) {
        htmlCard.style.display = 'block';
        visibleCount++;
      } else {
        htmlCard.style.display = 'none';
      }
    });

    // メッセージの表示/非表示
    if (visibleCount === 0) {
      noPostsMessage?.classList.remove('hidden');
    } else {
      noPostsMessage?.classList.add('hidden');
    }
  }

  function updateActiveButton(activeCategory: string | null) {
    filterButtons.forEach(button => {
      const htmlButton = button as HTMLElement;
      const buttonCategory = button.getAttribute('data-category') || '';

      if (buttonCategory === activeCategory) {
        htmlButton.className =
          'category-filter-btn px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 bg-primary-600 text-white';
      } else {
        htmlButton.className =
          'category-filter-btn px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700';
      }
    });
  }

  function updatePageTitle(category: string | null) {
    if (pageTitle) {
      if (category && category !== '') {
        pageTitle.textContent = category + 'の記事';
      } else {
        pageTitle.textContent = 'ブログ記事一覧';
      }
    }
  }

  function updateURL(category: string | null) {
    const url = new URL(window.location.href);
    if (category && category !== '') {
      url.searchParams.set('category', category);
    } else {
      url.searchParams.delete('category');
    }

    window.history.pushState({}, '', url.toString());
  }
});
