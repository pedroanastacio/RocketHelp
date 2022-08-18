import React, { useEffect, useState } from "react";
import { Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { VStack, Text, HStack, useTheme, ScrollView } from "native-base";
import firestore from "@react-native-firebase/firestore";
import { CircleWavyCheck, DesktopTower, Hourglass, ClipboardText } from "phosphor-react-native";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";

import { Header } from "../components/Header";
import { OrderProps } from "../components/Order";
import { Loading } from "../components/Loading";
import { CardDetails } from "../components/CardDetails";
import { Input } from "../components/Input";
import { Button } from "../components/Button";

import { OrderFirestoreDTO } from "../DTOs/OrderFirestoreDTO";

import { dateFormat } from "../utils/firestoreDateFormat";
import { ValidationMessage } from "../components/ValidationMessage";

type RouteParams = {
    orderId: string;
}

type OrderDetails = OrderProps & {
    description: string;
    solution: string;
}

const schema = yup.object({
    solution: yup
        .string()
        .required("Informe a solução para encerrar a solicitação."),
})

export function Details() {
    const [isLoading, setIsLoading] = useState(true);
    const [isClosingOrder, setIsClosingOrder] = useState(false);
    const [order, setOrder] = useState<OrderDetails>({} as OrderDetails);

    const { control, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema)
    });

    const { colors } = useTheme();
    const navigation = useNavigation();
    const route = useRoute();
    const { orderId } = route.params as RouteParams;

    const isOrderStatusClosed = order.status === "closed";
    const isOrderStatusOpened = order.status === "open";

    function handleOrderClose({ solution }) {
        setIsClosingOrder(true);

        firestore()
            .collection<OrderFirestoreDTO>("orders")
            .doc(orderId)
            .update({
                status: "closed",
                solution,
                closed_at: firestore.FieldValue.serverTimestamp(),
            })
            .then(() => {
                Alert.alert("Solicitação", "Soliticação encerrada");
                navigation.goBack();
            })
            .catch(error => {
                console.log(error);
                setIsClosingOrder(false);
                Alert.alert("Solicitação", "Não foi possível encerrar a solicitação");
            })
    }

    useEffect(() => {
        firestore()
            .collection<OrderFirestoreDTO>("orders")
            .doc(orderId)
            .get()
            .then((doc) => {
                const {
                    patrimony,
                    description,
                    status,
                    solution,
                    created_at,
                    closed_at,
                } = doc.data();

                const closed = closed_at ? dateFormat(closed_at) : null;

                setOrder({
                    id: doc.id,
                    patrimony,
                    description,
                    status,
                    solution,
                    opennedWhen: dateFormat(created_at),
                    closedWhen: closed,
                });

                setIsLoading(false);
            });
    }, [])

    if (isLoading) {
        return <Loading />
    }

    return (
        <VStack flex={1} bg="gray.700">
            <Header title="Solicitação" />

            <HStack bg="gray.500" justifyContent="center" p={4}>
                {
                    isOrderStatusClosed
                        ? <CircleWavyCheck size={22} color={colors.primary[700]} />
                        : <Hourglass size={22} color={colors.secondary[700]} />
                }

                <Text
                    fontSize="sm"
                    color={isOrderStatusClosed ? colors.primary[700] : colors.secondary[700]}
                    ml={2}
                    textTransform="uppercase"
                >
                    {isOrderStatusClosed ? "finalizado" : "em andamento"}
                </Text>
            </HStack>

            <ScrollView mx={5} showsHorizontalScrollIndicator={false}>
                <CardDetails
                    title="Equipamento"
                    description={`Patrimônio ${order.patrimony}`}
                    icon={DesktopTower}
                />

                <CardDetails
                    title="Descrição do problema"
                    description={order.description}
                    icon={ClipboardText}
                    footer={`Registrado em ${order.opennedWhen}`}
                />

                <CardDetails
                    title="Solução"
                    icon={CircleWavyCheck}
                    description={order.solution}
                    footer={order.closedWhen && `Encerrado em ${order.closedWhen}`}
                >
                    {
                        isOrderStatusOpened &&
                        <>
                            <Controller
                                name="solution"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        placeholder="Descrição da solução"
                                        h={24}
                                        textAlignVertical="top"
                                        multiline
                                        onBlur={field.onBlur}
                                        onChangeText={(val) => field.onChange(val)}
                                        value={field.value}
                                    />
                                )}
                            />
                            {errors.solution?.message && <ValidationMessage message={errors.solution?.message as string} mt={1} />}
                        </>
                    }
                </CardDetails>
            </ScrollView>

            {
                isOrderStatusOpened &&
                <Button
                    title="Encerrar solicitação"
                    m={5}
                    onPress={handleSubmit(handleOrderClose)}
                    isLoading={isClosingOrder}
                />
            }
        </VStack>
    );
}