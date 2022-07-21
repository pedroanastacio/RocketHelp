import { VStack } from "native-base";
import { useState } from "react";
import firestore from "@react-native-firebase/firestore";
import { useNavigation } from "@react-navigation/native";

import { Header } from "../components/Header";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { Alert } from "react-native";

export function Register() {
    const [isLoading, setIsloading] = useState(false);
    const [patrimony, setPatrimony] = useState("");
    const [description, setDescription] = useState("");

    const navigation = useNavigation();

    function handleNewOrderRegister() {
        if (!patrimony || !description) {
            Alert.alert("Registrar", "Preencha todos os campos.")
        }

        setIsloading(true);

        firestore()
            .collection("orders")
            .add({
                patrimony,
                description,
                status: "open",
                created_at: firestore.FieldValue.serverTimestamp()
            })
            .then(() => {
                Alert.alert("Solicitação", "Solicitação registrada com sucesso.");
                navigation.goBack();
            })
            .catch(error => {
                console.log(error);
                setIsloading(false);
                return Alert.alert("Solicitação", "Não foi possível registrar a solicitação.")
            })
    }

    return (
        <VStack flex={1} bg="gray.600">
            <Header title="Solicitação" />

            <VStack flex={1} pl={6} pr={6} pb={6}>
                <Input
                    placeholder="Número do patrimônio"
                    mt={4}
                    onChangeText={setPatrimony}
                />

                <Input
                    placeholder="Descrição do problema"
                    mt={5}
                    flex={1}
                    multiline
                    textAlignVertical="top"
                    onChangeText={setDescription}
                />

                <Button
                    title="Cadastrar"
                    mt={5}
                    isLoading={isLoading}
                    onPress={handleNewOrderRegister}
                />
            </VStack>
        </VStack>
    );
}