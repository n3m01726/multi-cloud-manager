import { Search, X } from 'lucide-react';

export default function SearchBar({ searchQuery, setSearchQuery, showSearchBar, toggleSearchBar, onSearch, isSearching }) {
  return (
    <div className={`px-6 pb-5 ${showSearchBar ? 'border-b border-gray-200' : ''}`}>
      <form
        onSubmit={onSearch}
        className={`flex gap-2 transition-all duration-300 ease-in-out overflow-hidden ${
          showSearchBar ? 'max-h-20 opacity-100 mt-4' : 'max-h-0 opacity-0'
        }`}
      >
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher dans tous vos fichiers..."
          className="flex-1 px-4 py-2 text-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={isSearching}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
        >
          {isSearching ? '...' : 'Rechercher'}
        </button>
      </form>
    </div>
  );
}
