import FilterDropdown from "./FilterDropdown";
import styles from "./SearchAndFilter.module.css";

function SearchAndFilter({
    search,
    onSearchChange,
    searchLabel = "Search:",
    searchPlaceholder = "Search...",
    filters = [],
    onClear,
}) {
    return (<details className={styles.filters}> <summary className={styles.filtersSummary}>
        Search & Filters </summary>

        <div className={styles.filterContent}>
            <div className={styles.searchField}>
                <label htmlFor="search-filter">
                    {searchLabel}
                </label>

                <input
                    className={styles.searchInput}
                    id="search-filter"
                    type="text"
                    placeholder={searchPlaceholder}
                    value={search}
                    onChange={(event) =>
                        onSearchChange(event.target.value)
                    }
                />
            </div>

            {filters.map((filter) => (
                <FilterDropdown
                    key={filter.id}
                    {...filter}
                />
            ))}

            <div className={styles.filterActions}>
                <button
                    type="button"
                    onClick={onClear}
                >
                    Clear Filters
                </button>
            </div>
        </div>
    </details>
    );

}

export default SearchAndFilter;
