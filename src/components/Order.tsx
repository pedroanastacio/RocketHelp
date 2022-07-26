import { HStack, Text, Box, useTheme, VStack, Circle, Pressable, IPressableProps } from 'native-base';
import { CircleWavyCheck, ClockAfternoon, Hourglass, XCircle } from 'phosphor-react-native';

export type OrderProps = {
    id: string;
    patrimony: string;
    opennedWhen: string;
    closedWhen?: string;
    status: "open" | "closed";
}

type Props = IPressableProps & {
    data: OrderProps;
}

export function Order({ data, ...rest }: Props) {
    const { colors } = useTheme();

    const statusColor = data.status === "open" ? colors.secondary[700] : colors.primary[700];

    const isStatusClosed = data.status === "closed";

    return (
        <Pressable {...rest}>
            <HStack
                bg="gray.600"
                mb={4}
                alignItems="center"
                justifyContent="space-between"
                rounded="sm"
                overflow="hidden"
            >
                <Box h="full" w={2} bg={statusColor} />

                <VStack
                    flex={1}
                    my={5}
                    ml={5}
                >
                    <Text color="white" fontSize="md">
                        Patrimônio {data.patrimony}
                    </Text>

                    <VStack mt={1}>
                        <HStack alignItems="center">
                            <ClockAfternoon size={18} color={colors.gray[300]} />

                            <Text color="gray.200" fontSize="xs" ml={1}>
                                {data.opennedWhen}
                            </Text>
                        </HStack>

                        {isStatusClosed &&
                            <HStack alignItems="center">
                                <XCircle size={18} color={colors.gray[300]} />

                                <Text color="gray.200" fontSize="xs" ml={1}>
                                    {data.closedWhen}
                                </Text>
                            </HStack>
                        }
                    </VStack>
                </VStack>

                <Circle bg="gray.500" h={12} w={12} mr={5}>
                    {
                        isStatusClosed
                            ? <CircleWavyCheck size={24} color={statusColor} />
                            : <Hourglass size={24} color={statusColor} />
                    }
                </Circle>
            </HStack>
        </Pressable>
    );
}

