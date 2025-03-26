import { styles } from "@/app/styles";

interface ProgressionProps {
    progress: number
}
export const Progression: React.FC<ProgressionProps> = ({ progress }) => {
    return (
        <div className="mb-2">
            <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Progression</span>
                <span className="text-sm font-medium">{progress}%</span>
            </div>
            <ProgressBar progress={progress} />
        </div>
    )
}

interface ProgressBarProps {
    progress: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress = 0 }) => {
    return (
        <div className={styles.progressBar}>
            <div
                className={styles.progressBarFill}
                style={{
                    width: `${progress}%`,
                    backgroundColor:
                        progress < 30 ? '#f87171' :
                            progress < 70 ? '#facc15' :
                                '#4ade80'
                }}
            />
        </div>
    )
}