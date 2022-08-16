import { Text, ITextProps } from "native-base";

type Props = ITextProps & {
    message: string
}

export function ValidationMessage({ message, ...rest }: Props) {
    return (
        <Text color="red.700" alignSelf="flex-start" {...rest}>
            {message}
        </Text>
    );
}