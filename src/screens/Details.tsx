import { useEffect, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { VStack, Text, HStack, useTheme, ScrollView } from "native-base";
import firestore from "@react-native-firebase/firestore";
import { CircleWavyCheck, DesktopTower, Hourglass, ClipboardText } from "phosphor-react-native";

import { Header } from "../components/Header";
import { OrderProps } from "../components/Order";
import { Loading } from "../components/Loading";
import { CardDetails } from "../components/CardDetails";
import { Input } from "../components/Input";
import { Button } from "../components/Button";

import { OrderFirestoreDTO } from "../DTOs/OrderFirestoreDTO";

import { dateFormat } from "../utils/firestoreDateFormat";
import { Alert } from "react-native";

type RouteParams = {
    orderId: string;
}

type OrderDetails = OrderProps & {
    description: string;
    solution: string;
    closed: string;
}

export function Details() {
    const [isLoading, setIsLoading] = useState(true);
    const [isClosingOrder, setIsClosingOrder] = useState(false);
    const [solution, setSolution] = useState("");
    const [order, setOrder] = useState<OrderDetails>({} as OrderDetails);

    const { colors } = useTheme();
    const navigation = useNavigation();
    const route = useRoute();
    const { orderId } = route.params as RouteParams;

    const isOrderStatusClosed = order.status === "closed";
    const isOrderStatusOpened = order.status === "open";

    function handleOrderClose() {
        if (!solution) {
            return Alert.alert("Solicitação", "Informe a suloção para encerrar a solicitação.");
        }

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
                    when: dateFormat(created_at),
                    closed
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
                    footer={`Registrado em ${order.when}`}
                />

                <CardDetails
                    title="Solução"
                    icon={CircleWavyCheck}
                    description={order.solution}
                    footer={order.closed && `Encerrado em ${order.closed}`}
                >
                    {
                        isOrderStatusOpened &&
                        <Input
                            placeholder="Descrição da solução"
                            onChangeText={setSolution}
                            h={24}
                            textAlignVertical="top"
                            multiline
                        />
                    }
                </CardDetails>
            </ScrollView>

            {
                isOrderStatusOpened &&
                <Button
                    title="Encerrar solicitação"
                    m={5}
                    onPress={handleOrderClose}
                    isLoading={isClosingOrder}
                />
            }
        </VStack>
    );
}