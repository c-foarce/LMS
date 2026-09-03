function FilterDropdown({
    value,
    onChange,
    defaultLabel,
    options,
    getValue,
    getLabel,
    className,
    label,
    id,
}) {
    return (
        <div>
            <label htmlFor={id}>
                {label}
            </label>

            <select
                id={id}
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
        </div>
    );
}

export default FilterDropdown;