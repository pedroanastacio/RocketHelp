import { Input, Icon, Pressable, useTheme } from "native-base";
import { IInputProps } from "native-base";
import { MagnifyingGlass, X } from "phosphor-react-native";

type Props = IInputProps & {
    placeholder?: string;
    text: string;
    onCancel: () => void;
    onChangeText: (text: string) => void;
}

export function SearchBar({ placeholder, text, onCancel, onChangeText, ...rest }: Props) {
    const { colors } = useTheme();

    const isEmpty = text === "";

    return (
        <Input
            placeholder={placeholder ?? "Pesquisar"}
            bg="gray.600"
            flex={1}
            h={12}
            size="md"
            borderWidth={0}
            fontSize="md"
            fontFamily="body"
            color="gray.100"
            placeholderTextColor="gray.300"
            _focus={{ bg: "gray.600" }}
            InputLeftElement={<Icon as={<MagnifyingGlass size={20} color={colors.gray[300]} style={{ marginLeft: 12 }} />} />}
            InputRightElement={<>{!isEmpty && <Pressable onPress={onCancel}><Icon as={<X size={20} color={colors.gray[300]} style={{ marginRight: 12 }} />} /></Pressable>}</>}
            value={text}
            onChangeText={onChangeText}
            {...rest}
        />
    );
}