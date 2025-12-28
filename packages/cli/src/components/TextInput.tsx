import InkTextInput from "ink-text-input";

interface TextInputProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	onSubmit?: (value: string) => void;
}

export function TextInput({
	value,
	onChange,
	placeholder,
	onSubmit,
}: TextInputProps) {
	return (
		<InkTextInput
			value={value}
			onChange={onChange}
			placeholder={placeholder}
			onSubmit={onSubmit}
		/>
	);
}
