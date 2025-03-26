import { styles } from "@/app/styles";

type ButtonVariant = 'primary' | 'secondary' | 'delete' | 'edit';

interface ButtonProps {
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    children: React.ReactNode;
    variant?: ButtonVariant;
    preventDefault?: boolean;
    classes?: string[] | string
}

const Button: React.FC<ButtonProps> = ({
    onClick = () => { },
    variant,
    children,
    preventDefault = false,
    classes = []
}) => {
    const baseStyle = styles.button
    let variantStyle = '';
    switch (variant) {
        case 'primary':
            variantStyle = "bg-blue-500 hover:bg-blue-600 text-white";
            break;
        case 'secondary':
            variantStyle = "bg-gray-200 hover:bg-gray-300 text-gray-800";
            break;
        case 'delete':
            variantStyle = "text-gray-500 hover:text-red-500 p-1";
            break;
        case 'edit':
            variantStyle = 'text-gray-500 hover:text-blue-500'
            break
    }

    const addedClasses: string = typeof classes === 'string' ? classes : classes.join(' ')

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (preventDefault) {
            event.preventDefault();
        }
        onClick(event);
    };
    return (
        <button className={`${baseStyle} ${variantStyle} ${addedClasses}`} onClick={handleClick}>
            {children}
        </button>
    );
};

export default Button;