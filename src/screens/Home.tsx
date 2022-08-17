import React, { useEffect, useState } from "react";
import { Badge, Center, FlatList, Heading, HStack, IconButton, Text, useTheme, VStack } from "native-base";
import { ChatTeardropText, SignOut } from "phosphor-react-native";
import { Alert, Keyboard } from "react-native";
import { useNavigation } from "@react-navigation/native";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

import { Filter } from "../components/Filter";
import { Order, OrderProps } from "../components/Order";
import { Button } from "../components/Button";
import { Loading } from "../components/Loading";
import { SearchBar } from "../components/SearchBar";

import { dateFormat } from "../utils/firestoreDateFormat";

import Logo from "../assets/logo_secondary.svg";

export function Home() {
    const [isLoading, setIsLoading] = useState(true);
    const [statusSelected, setStatusSelected] = useState<"open" | "closed">("open");
    const [orders, setOrders] = useState<OrderProps[]>([]);
    const [searchText, setSearchText] = useState<string>("");

    const navigation = useNavigation();
    const { colors } = useTheme();

    let subscriber: () => void;

    const isStatusSelectedOpen = statusSelected === "open";
    const isStatusSelectedClosed = statusSelected === "closed";

    const isSearching = searchText !== "";

    function handleNewOrder() {
        navigation.navigate("new");
    }

    function handleOpenDetails(orderId: string) {
        navigation.navigate("details", { orderId })
    }

    function handleLogout() {
        auth()
            .signOut()
            .catch(error => {
                console.log(error);
                return Alert.alert("Sair", "Não foi possível sair")
            })
    }

    function handleSearchTextChange(text: string) {
        setSearchText(text);
    }

    function handleSearchCancel() {
        setSearchText("");
        Keyboard.dismiss();
    }

    useEffect(() => {
        setIsLoading(true);

        if (searchText === "") {
            subscriber = firestore()
                .collection("orders")
                .where("status", "==", statusSelected)
                .orderBy("created_at", "desc")
                .onSnapshot(snapshot => {
                    const data = snapshot.docs.map(doc => {
                        const { patrimony, description, status, created_at } = doc.data();

                        return {
                            id: doc.id,
                            patrimony,
                            description,
                            status,
                            when: dateFormat(created_at),
                        }
                    });

                    setOrders(data);
                    setIsLoading(false);
                }, (error) => console.error(error));
        } else {
            subscriber = firestore()
                .collection("orders")
                .where("patrimony", "==", searchText)
                .where("status", "==", statusSelected)
                .orderBy("created_at", "desc")
                .onSnapshot(snapshot => {
                    const data = snapshot.docs.map(doc => {
                        const { patrimony, description, status, created_at } = doc.data();

                        return {
                            id: doc.id,
                            patrimony,
                            description,
                            status,
                            when: dateFormat(created_at),
                        }
                    });

                    setOrders(data);
                    setIsLoading(false);
                }, (error) => console.error(error));
        }

        return () => { subscriber() };
    }, [searchText, statusSelected]);

    return (
        <VStack flex={1} pb={6} bg="gray.700">
            <HStack
                w="full"
                justifyContent="space-between"
                alignItems="center"
                bg="gray.600"
                pt={12}
                pb={5}
                px={6}
            >
                <Logo />

                <IconButton
                    icon={<SignOut size={26} color={colors.gray[300]} />}
                    onPress={handleLogout}
                />
            </HStack>

            <VStack flex={1} px={6}>
                <HStack w="full" mt={8} mb={4} justifyContent="space-between" alignItems="center">
                    <Heading color="gray.100">
                        Meus chamados
                    </Heading>

                    <Badge rounded="sm" variant="solid">
                        <Text color="gray.200">
                            {orders.length}
                        </Text>
                    </Badge>
                </HStack>

                <HStack space={3} mb={4}>
                    <Filter
                        title="Em andamento"
                        type="open"
                        onPress={() => setStatusSelected("open")}
                        isActive={isStatusSelectedOpen}
                    />

                    <Filter
                        title="Finalizados"
                        type="closed"
                        onPress={() => setStatusSelected("closed")}
                        isActive={isStatusSelectedClosed}
                    />
                </HStack>

                <SearchBar
                    text={searchText}
                    onCancel={handleSearchCancel}
                    onChangeText={handleSearchTextChange}
                />

                {
                    isLoading ? <Loading /> :
                        <FlatList
                            data={orders}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => <Order data={item} onPress={() => handleOpenDetails(item.id)} />}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 100 }}
                            ListEmptyComponent={() => (
                                <Center>
                                    <ChatTeardropText color={colors.gray[300]} size={40} />
                                    <Text color="gray.300" fontSize="md" mt={6} textAlign="center">
                                        {isSearching ?
                                            `Nenhuma solicitação ${isStatusSelectedOpen ? "em andamento" : "finalizada"} \n foi encontrada` :
                                            `Você ainda não possui \n solicitações ${isStatusSelectedOpen ? "em andamento" : "finalizadas"}`
                                        }
                                    </Text>
                                </Center>
                            )}
                        />
                }

                <Button title="Nova solicitação" onPress={handleNewOrder} />
            </VStack>
        </VStack>
    );
}