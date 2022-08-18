import { Actionsheet, Heading, HStack, IActionsheetItemProps, Text, VStack } from "native-base";
import React from "react";

type Props = IActionsheetItemProps & {
    title: string;
    subtitle: string;
    icon: JSX.Element;
}

export function FilterItem({ title, subtitle, icon, ...rest }: Props) {

    return (
        <Actionsheet.Item bgColor="gray.600" p={0} justifyItems="start">
            <HStack alignItems="center">
                {icon}

                <VStack ml={2}>
                    <Heading color="gray.200" size="sm">{title}</Heading>
                    <Text color="gray.300" fontSize="xs">{subtitle}</Text>
                </VStack>
            </HStack>
        </Actionsheet.Item>
    );
}