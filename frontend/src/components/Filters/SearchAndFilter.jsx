import DateRangePicker from "@wojtekmaj/react-daterange-picker";

import FilterDropdown from "./FilterDropdown";
import styles from "./SearchAndFilter.module.css";

import "@wojtekmaj/react-daterange-picker/dist/DateRangePicker.css";
import "react-calendar/dist/Calendar.css";

function SearchAndFilter({
    search,
    onSearchChange,
    searchLabel = "Search:",
    searchPlaceholder = "Search...",
    showSearch = true,
    filters = [],
    extraControls,
    showDateRange = false,
    fromDate = "",
    toDate = "",
    onDateRangeChange,
    dateRangeLabel = "Date range:",
    onClear,
}) {
    const formatDate = (date) => {
        if (!date) {
            return "";
        }

        return [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, "0"),
            String(date.getDate()).padStart(2, "0"),
        ].join("-");
    };

    return (
        <details className={styles.filters}>
            <summary className={styles.filtersSummary}>
                Search & Filters
            </summary>

            <div className={styles.filterContent}>
                <div className={styles.controlColumn}>
                    {showSearch && (
                        <div className={styles.searchField}>
                            <label htmlFor="search-filter">{searchLabel}</label>
                            <input
                                className={styles.searchInput}
                                id="search-filter"
                                type="search"
                                placeholder={searchPlaceholder}
                                value={search}
                                onChange={(event) => onSearchChange(event.target.value)}
                            />
                        </div>
                    )}

                    {filters
                        .filter((filter) => (filter.column || "left") === "left")
                        .map((filter) => (
                            <FilterDropdown key={filter.id} {...filter} />
                        ))}
                </div>

                <div className={styles.controlColumn}>


                    {showDateRange && (
                        <div className={styles.dateRange}>
                            <label className={styles.dateLabel}>
                                {dateRangeLabel}
                            </label>

                            <DateRangePicker
                                value={[
                                    fromDate ? new Date(`${fromDate}T12:00:00`) : null,
                                    toDate ? new Date(`${toDate}T12:00:00`) : null,
                                ]}
                                onChange={(range) => {
                                    onDateRangeChange?.({
                                        fromDate: formatDate(range?.[0]),
                                        toDate: formatDate(range?.[1]),
                                    });
                                }}
                                format="dd/MM/y"
                                rangeDivider=" – "
                                clearIcon={null}
                                calendarIcon={null}
                                closeCalendar={false}
                            />
                        </div>
                    )}

                    {filters
                        .filter((filter) => filter.column === "right")
                        .map((filter) => (
                            <FilterDropdown key={filter.id} {...filter} />
                        ))}

                    {extraControls && (
                        <div className={styles.extraControls}>
                            {extraControls}
                        </div>
                    )}
                </div>

                <div className={styles.filterActions}>
                    <button type="button" onClick={onClear}>
                        Clear Filters
                    </button>
                </div>
            </div>
        </details>
    );
}

export default SearchAndFilter;