

function RenderCard({ title, details, actions }) {
    return (
        <div>
            <h2>{title}</h2>

            {details.map(({ label, value }) => (
                <p key={label}>
                    <strong>{label}:</strong> {value}
                </p>
            ))}

            {actions && (
                <div>
                    {actions}
                </div>
            )}
        </div>
    )
}

export default RenderCard