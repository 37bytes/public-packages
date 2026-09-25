const Button = ({ onClick }: { onClick: () => void }): null => {
    onClick();
    return null;
};

export const AddCompanyButton = ({ addCompany }: { addCompany: () => Promise<void> }): React.ReactNode => (
    <Button onClick={addCompany} />
);
