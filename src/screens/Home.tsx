import React, { useEffect, useState } from "react";
import {
    Badge,
    Center,
    IconButton,
    FlatList,
    Heading,
    HStack,
    Text,
    useTheme,
    VStack,
    useDisclose,
    Actionsheet,
    Pressable
} from "native-base";
import {
    Calendar,
    ChatTeardropText,
    SignOut,
    SlidersHorizontal,
    SortAscending,
    SortDescending,
    X
} from "phosphor-react-native";
import { Alert, Keyboard } from "react-native";
import { useNavigation } from "@react-navigation/native";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

import { Filter } from "../components/Filter";
import { Order, OrderProps } from "../components/Order";
import { Button } from "../components/Button";
import { Loading } from "../components/Loading";
import { SearchBar } from "../components/SearchBar";
import { SortFilter } from "../components/SortFilter";
import { FilterItem } from "../components/FilterItem";

import { dateFormat } from "../utils/firestoreDateFormat";

import Logo from "../assets/logo_secondary.svg";

export function Home() {
    const [isLoading, setIsLoading] = useState(true);
    const [statusSelected, setStatusSelected] = useState<"open" | "closed">("open");
    const [orders, setOrders] = useState<OrderProps[]>([]);
    const [searchText, setSearchText] = useState<string>("");
    const [orderBy, setOrderBy] = useState<"created_at" | "closed_at" | null>(null);
    const [sort, setSort] = useState<"asc" | "desc">("desc");

    const navigation = useNavigation();
    const { colors } = useTheme();

    const { isOpen, onOpen, onClose } = useDisclose();

    let subscriber: () => void;

    const isStatusSelectedOpen = statusSelected === "open";
    const isStatusSelectedClosed = statusSelected === "closed";

    const isSearching = searchText !== "";
    const isOrdering = !!orderBy;

    const dateToOrder = isStatusSelectedOpen ? "created_at" : "closed_at";

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

    function handleStatusOpenClick() {
        setStatusSelected("open");
    }

    function handleStatusClosedClick() {
        setStatusSelected("closed");
    }

    function handleSearchTextChange(text: string) {
        setSearchText(text);
    }

    function handleSearchCancel() {
        setSearchText("");
        Keyboard.dismiss();
    }

    function handleOrderByCreatedAt() {
        setOrderBy("created_at");
    }

    function handleOrderByClosedAt() {
        setOrderBy("closed_at");
    }

    function handleOrderCancel() {
        setOrderBy(null);
    }

    function handleSortClick() {
        if (sort === "desc")
            setSort("asc");
        else
            setSort("desc");
    }

    useEffect(() => {
        setOrderBy(null);
    }, [statusSelected])


    useEffect(() => {
        setIsLoading(true);

        if (searchText === "") {
            subscriber = firestore()
                .collection("orders")
                .where("status", "==", statusSelected)
                .orderBy(orderBy ?? dateToOrder, sort)
                .onSnapshot(snapshot => {
                    const data = snapshot.docs.map(doc => {
                        const { patrimony, description, status, created_at, closed_at } = doc.data();

                        return {
                            id: doc.id,
                            patrimony,
                            description,
                            status,
                            opennedWhen: dateFormat(created_at),
                            closedWhen: dateFormat(closed_at),
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
                .orderBy(orderBy ?? dateToOrder, sort)
                .onSnapshot(snapshot => {
                    const data = snapshot.docs.map(doc => {
                        const { patrimony, description, status, created_at, closed_at } = doc.data();

                        return {
                            id: doc.id,
                            patrimony,
                            description,
                            status,
                            opennedWhen: dateFormat(created_at),
                            closedWhen: dateFormat(closed_at),
                        }
                    });

                    setOrders(data);
                    setIsLoading(false);
                }, (error) => console.error(error));
        }

        return () => { subscriber() };
    }, [searchText, statusSelected, orderBy, sort]);

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
                    _pressed={{ bg: "gray.600" }}
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
                        onPress={handleStatusOpenClick}
                        isActive={isStatusSelectedOpen}
                    />

                    <Filter
                        title="Finalizados"
                        type="closed"
                        onPress={handleStatusClosedClick}
                        isActive={isStatusSelectedClosed}
                    />
                </HStack>

                <HStack mb={4}>
                    <SearchBar
                        mr={3}
                        text={searchText}
                        onCancel={handleSearchCancel}
                        onChangeText={handleSearchTextChange}
                    />

                    <IconButton
                        onPress={onOpen}
                        icon={<SlidersHorizontal size={24} color={colors.gray[300]} />}
                        bgColor="gray.600"
                        _pressed={{ bgColor: "gray.500" }}
                    />

                    <Actionsheet
                        isOpen={isOpen}
                        onClose={onClose}
                    >
                        <Actionsheet.Content bgColor="gray.600" py={4} px={6}>
                            <VStack alignItems="center" mt={4}>
                                <VStack></VStack>
                                <Heading size="sm" color="gray.100" mb={4}>Ordernar por</Heading>

                                <HStack space={3} mb={6}>
                                    <SortFilter
                                        isActive={orderBy === "created_at"}
                                        onPress={handleOrderByCreatedAt}
                                        title="Data de abertura"
                                    />

                                    <SortFilter
                                        isActive={orderBy === "closed_at"}
                                        onPress={handleOrderByClosedAt}
                                        title="Data de finalização"
                                        isDisabled={isStatusSelectedOpen}
                                    />
                                </HStack>

                                <Heading size="sm" color="gray.100" mb={4}>Filtrar por</Heading>

                                <VStack>
                                    <FilterItem title="Hoje" subtitle={new Date().getDate().toString()} icon={<Calendar size={32} color={colors.red[500]} />} />
                                </VStack>
                            </VStack>
                        </Actionsheet.Content>
                    </Actionsheet>
                </HStack>

                {isOrdering &&
                    <HStack mt={-2} mb={2} justifyContent="space-between" alignItems="center">
                        <Pressable onPress={handleSortClick}>
                            <HStack alignItems="center" space={1}>
                                <Heading color="red.300" size="xs" fontWeight="light">
                                    {orderBy === "created_at" ? "Data de abertura" : "Data de finalização"}
                                </Heading>
                                {sort === "desc" ?
                                    <SortDescending size={20} color={colors.red[300]} />
                                    :
                                    <SortAscending size={20} color={colors.red[300]} />
                                }
                            </HStack>
                        </Pressable>

                        <IconButton
                            onPress={handleOrderCancel}
                            icon={<X size={18} color={colors.gray[300]} />}
                        />
                    </HStack>
                }

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
        </VStack >
    );
}