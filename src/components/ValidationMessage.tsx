import { Text, ITextProps } from "native-base";
import { DeepRequired, FieldError, FieldErrorsImpl, Merge } from "react-hook-form";

type Props = ITextProps & {
    message: Merge<FieldError, FieldErrorsImpl<DeepRequired<any>>>
}

export function ValidationMessage({ message, ...rest }: Props) {
    return (
        <Text color="red.700" alignSelf="flex-start" {...rest}>
            {message}
        </Text>
    );
}