import { Text, Button, IButtonProps, useTheme } from 'native-base';

type Props = IButtonProps & {
    title: string;
    isActive?: boolean;
}

export function SortFilter({ title, isActive = false, ...rest }: Props) {

    return (
        <Button
            bgColor={isActive ? "red.700" : "gray.500"}
            flex={1}
            size="sm"
            rounded="sm"
            {...rest}
        >
            <Text
                color={isActive ? "gray.100" : "gray.200"}
                fontSize="sm"
            >
                {title}
            </Text>
        </Button>
    );
}