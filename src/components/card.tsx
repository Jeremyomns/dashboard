import { styles } from "@/app/styles"

interface CardProps {
    children: React.ReactNode
}

export const Card: React.FC<CardProps> = ({children}) => {
    return (
        <div className={styles.card}>
            {children}
        </div>
    )
}

interface CardHeaderProps {
    children: React.ReactNode
}

export const CardHeader: React.FC<CardProps> = ({children}) => {
    return (
        <div className={styles.cardHeader}>
            {children}
        </div>
    )
}

interface CardBodyProps {
    children: React.ReactNode
}

export const CardBody: React.FC<CardProps> = ({children}) => {
    return (
        <div className={styles.cardBody}>
            {children}
        </div>
    )
}