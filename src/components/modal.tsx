interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                {children}
                <div className="mt-4 text-right">
                    <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>Fermer</button>
                </div>
            </div>
        </div>
    );
};