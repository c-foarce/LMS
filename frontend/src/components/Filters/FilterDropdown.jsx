function FilterDropdown({
    value,
    onChange,
    defaultLabel,
    options,
    getValue,
    getLabel,
    className,
}) {
    return (
        <select
            className={className}
            value={value}
            onChange={(event) => onChange(event.target.value)}
        >
            <option value="">
                {defaultLabel}
            </option>

            {options.map(option => (
                <option
                    key={getValue(option)}
                    value={getValue(option)}
                >
                    {getLabel(option)}
                </option>
            ))}
        </select>
    );
}

export default FilterDropdown