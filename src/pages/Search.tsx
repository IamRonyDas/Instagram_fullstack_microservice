import { useMemo, useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import PageHeader from '../components/layout/PageHeader';
import SearchUserRow from '../components/search/SearchUserRow';
import { getUser, searchSuggestions, searchUsers } from '../data/mockUsers';
import './Search.css';

export default function Search() {
  const [query, setQuery] = useState('');

  const results = useMemo(() => searchUsers(query), [query]);

  const suggestions = useMemo(
    () => searchSuggestions.map((u) => getUser(u)).filter((u): u is NonNullable<typeof u> => Boolean(u)),
    []
  );

  return (
    <AppLayout narrow>
      <div className="search-page">
        <PageHeader title="Search" backTo="/" />

        <div className="search-page__input-wrap">
          <span className="search-page__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3-3" />
            </svg>
          </span>
          <input
            type="search"
            className="search-page__input"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {query && (
            <button
              type="button"
              className="search-page__clear"
              onClick={() => setQuery('')}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <div className="search-page__results">
          {query ? (
            results.length > 0 ? (
              results.map((user) => <SearchUserRow key={user.username} user={user} />)
            ) : (
              <p className="search-page__empty">No results found for &quot;{query}&quot;</p>
            )
          ) : (
            <>
              <h2 className="search-page__section-title">Suggested for you</h2>
              {suggestions.map((user) => (
                <SearchUserRow key={user.username} user={user} />
              ))}
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
