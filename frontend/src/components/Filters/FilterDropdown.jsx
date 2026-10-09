import styles from "./FilterDropdown.module.css";


function FilterDropdown({
    value,
    onChange,
    defaultLabel,
    options,
    getValue,
    getLabel,
    className,
    layoutClassName,
    label,
    id,
}) {
    return (
        <div className={`${styles.dropdown} ${layoutClassName || ""}`}>
            <label htmlFor={id}>
                {label}
            </label>
            <select
                id={id}
                className={`${styles.select} ${className || ""}`}
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
