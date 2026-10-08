import styles from "./RenderCard.module.css";

function RenderCard({ title, details, actions }) {
    return (
        <article className={styles.card}>
            <h2 className={styles.title}>{title}</h2>

            <div className={styles.details}>
                {details.map(({ label, value }) => (
                    <p key={label} className={styles.detail}>
                        <strong>{label}:</strong> {value}
                    </p>
                ))}
            </div>

            {actions && (
                <div className={styles.actions}>
                    {actions}
                </div>
            )}
        </article>
    );
}

export default RenderCard;